/**
 * Gemini AI Intelligence Engine for SAT Mistake Analysis.
 * Configured with gemini-2.5-flash with automatic fallback to gemini-flash-latest.
 * Supports environment variables, localStorage override, and default fallback.
 */

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

/**
 * Resolves the effective API key from localStorage or Vite env.
 */
export function getEffectiveApiKey() {
  try {
    const customKey = localStorage.getItem('sat_gemini_api_key');
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  } catch {}

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

/**
 * Saves a user-specified custom API key to localStorage.
 */
export function setStoredApiKey(key) {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem('sat_gemini_api_key');
    } else {
      localStorage.setItem('sat_gemini_api_key', key.trim());
    }
  } catch {}
}

/**
 * Test if an API key is valid by sending a quick ping request.
 */
export async function testGeminiApiKey(key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with OK' }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Invalid key (${response.status}): ${errText}`);
  }
  return true;
}

/**
 * Execute Gemini REST API request with primary model and automatic fallback.
 */
async function callGeminiRaw(payload, model = PRIMARY_MODEL) {
  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (netErr) {
    throw new Error(`Network error contacting Gemini API: ${netErr.message}`);
  }

  // If primary model failed with 404, retry once with fallback
  if (response.status === 404 && model === PRIMARY_MODEL) {
    console.warn(`Model ${PRIMARY_MODEL} returned 404, trying fallback ${FALLBACK_MODEL}...`);
    return callGeminiRaw(payload, FALLBACK_MODEL);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  return text;
}

/**
 * Strips markdown code blocks (```json ... ```) and parses JSON cleanly.
 */
function parseCleanJson(rawText) {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse AI response as JSON: ${cleaned.slice(0, 300)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. QUESTION IMAGE / PDF OCR & DIAGNOSTICS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

export const MULTIMODAL_SAT_PROMPT = `You are a world-class SAT Master Tutor and Diagnostic Performance Analyst.

Analyze this image of an SAT question (Math or Reading & Writing).
Extract the question details and perform a deep diagnostic error analysis.

You MUST return ONLY a valid JSON array of objects (one per question visible in the image).
Never include markdown backticks around the output.

Schema for each question:
[
  {
    "section": "Math" | "Reading & Writing",
    "module": "Module 1" | "Module 2",
    "questionNumber": "string (e.g. '14' or 'Q14' or '1')",
    "difficulty": "Easy" | "Medium" | "Hard",
    "questionText": "Full text of the question or passage excerpt",
    "options": {
      "A": "text for choice A",
      "B": "text for choice B",
      "C": "text for choice C",
      "D": "text for choice D"
    },
    "correctAnswer": "A" | "B" | "C" | "D",
    "selectedAnswer": "A" | "B" | "C" | "D" | "Unknown",
    "domain": "Algebra | Advanced Math | Problem-Solving and Data Analysis | Geometry and Trigonometry | Craft and Structure | Information and Ideas | Standard English Conventions | Expression of Ideas",
    "topic": "The specific SAT topic tested",
    "subtopic": "Detailed sub-skill or rule",
    "errorCategory": "Knowledge Gap" | "Application Error" | "Misreading" | "Calculation Error" | "Time Management" | "Careless Execution" | "Guessing" | "Conceptual Misunderstanding",
    "rootCause": "Clear explanation of why the selected answer is tempting/wrong and where the student went off track",
    "conceptTested": "The core mathematical formula or grammatical/reading principle tested",
    "stepByStepSolution": [
      "Step 1: ...",
      "Step 2: ...",
      "Step 3: ..."
    ],
    "misconceptionsDetected": [
      "Specific cognitive trap or flaw in reasoning"
    ],
    "knowsRuleStrugglesApplication": true | false,
    "correctiveExercise": "Actionable 1-sentence drill recommendation for this exact mistake",
    "takeaway": "Punchy 1-sentence memorable rule to avoid making this error again"
  }
]

Strict Rules:
- If the student's selected answer is marked or circled in the image, extract it. If not visible, set selectedAnswer to "Unknown".
- Differentiate carefully between a "Knowledge Gap" (didn't know rule) and an "Application Error" (knew rule, misapplied to problem).
- If multiple questions are visible, produce one object for each.
- Output pure JSON array only.`;

/**
 * Analyzes an image (base64) using Gemini Vision.
 */
export async function analyzeQuestionImage(base64Data, mimeType = 'image/jpeg') {
  const payload = {
    contents: [
      {
        parts: [
          { text: MULTIMODAL_SAT_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  const raw = await callGeminiRaw(payload);
  const parsed = parseCleanJson(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEEP MISTAKE DIAGNOSIS (FOR MANUALLY ENTERED OR UNANALYZED QUESTIONS)
// ─────────────────────────────────────────────────────────────────────────────

export async function deepDiagnoseMistake({
  section,
  questionText,
  options,
  selectedAnswer,
  correctAnswer,
  studentNotes,
}) {
  const prompt = `You are an expert SAT tutor analyzing a student's mistake.

Question Details:
- Section: ${section}
- Question: ${questionText}
- Choices: A) ${options?.A || ''} | B) ${options?.B || ''} | C) ${options?.C || ''} | D) ${options?.D || ''}
- Student's Answer: ${selectedAnswer}
- Correct Answer: ${correctAnswer}
- Student's Reflection: ${studentNotes || 'None provided'}

Provide a deep diagnostic breakdown. Return ONLY a JSON object:
{
  "conceptTested": "Exact SAT concept tested",
  "errorCategory": "Knowledge Gap | Application Error | Misreading | Calculation Error | Time Management | Careless Execution | Guessing | Conceptual Misunderstanding",
  "rootCause": "Why ${selectedAnswer} was chosen and why it is wrong",
  "stepByStepSolution": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "misconceptionsDetected": [
    "Specific misconception"
  ],
  "knowsRuleStrugglesApplication": true,
  "correctiveExercise": "Targeted drill activity",
  "takeaway": "One-line rule to remember"
}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.15, maxOutputTokens: 2048 },
  };

  const raw = await callGeminiRaw(payload);
  return parseCleanJson(raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTEXTUAL AI SAT TUTOR CHAT
// ─────────────────────────────────────────────────────────────────────────────

export async function askSATTutorChat(chatHistory, userMessage, mistakeSummaryContext) {
  const systemInstruction = `You are "Socrates-SAT", an elite AI SAT performance analyst and private coach.
You have FULL ACCESS to this student's actual SAT mistake database, test history, accuracy metrics, and error patterns:

=== STUDENT PERFORMANCE CONTEXT ===
${mistakeSummaryContext}
===================================

COACHING GUIDELINES:
1. Always ground your responses in their ACTUAL recorded questions, topics, test names, and error categories. Never give generic platitudes like "just practice more math."
2. When they ask "Why do I keep getting these wrong?" or "What is my biggest weakness?", cite their specific topic and recurring misconceptions from the data above.
3. If they ask about Module 1 vs Module 2, explain the adaptive Digital SAT mechanics (Module 2 has higher difficulty questions, tighter time pressure, and traps).
4. If they ask for a practice question, generate a realistic SAT-format question with 4 choices (A, B, C, D) targeting their #1 recorded weakness, along with an explanation after they attempt it or in spoiler format.
5. Use clear, encouraging, highly analytical language with bullet points and bold math notation where helpful.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction + '\n\nStudent says: ' + userMessage }],
    },
  ];

  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    const formattedTurns = [];
    formattedTurns.push({
      role: 'user',
      parts: [{ text: systemInstruction }],
    });
    formattedTurns.push({
      role: 'model',
      parts: [{ text: "Understood. I have reviewed your mistake database and performance history. I'm ready to analyze your SAT preparation and help you target your highest-leverage improvements." }],
    });

    for (const msg of chatHistory.slice(-8)) {
      formattedTurns.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    formattedTurns.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    contents.length = 0;
    contents.push(...formattedTurns);
  }

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.3,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  return callGeminiRaw(payload);
}

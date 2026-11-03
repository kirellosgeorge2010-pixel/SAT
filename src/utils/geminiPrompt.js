/**
 * Gemini API prompt template for SAT error extraction.
 * Instructs the model to return a strict JSON array.
 */
export const EXTRACTION_PROMPT = `You are an expert SAT tutor analyzing images of SAT practice test questions or error logs.

Your task is to extract structured information about each SAT question visible in the image(s).

Return ONLY a valid JSON array (no markdown, no explanation). Each element must follow this exact schema:

[
  {
    "questionNumber": "string (e.g. '12' or 'Q12' or unknown)",
    "section": "Math | Reading & Writing | Unknown",
    "questionSummary": "Brief 1-2 sentence description of what the question asked",
    "correctAnswer": "A | B | C | D | Unknown",
    "selectedAnswer": "A | B | C | D | Unknown | Blank",
    "domain": "Algebra | Advanced Math | Problem-Solving & Data Analysis | Geometry & Trigonometry | Craft & Structure | Information & Ideas | Standard English Conventions | Expression of Ideas | Unknown",
    "specificTopic": "string (e.g. 'Linear equations in two variables', 'Vocabulary in context', 'Subject-verb agreement')",
    "rootCause": "Careless Error | Concept Breakdown | Time Pressure | Misread Question | Calculation Error | Unfamiliar Topic | Overthinking | Unknown",
    "explanation": "string (2-4 sentence explanation of the correct approach and key takeaway)"
  }
]

Rules:
- If multiple questions are visible, return one object per question.
- If a field cannot be determined from the image, use its "Unknown" / "Blank" value.
- Do NOT wrap the JSON in markdown code blocks.
- Do NOT include any text before or after the JSON array.
- Be conservative: only extract questions that are clearly visible and readable.
`;

/**
 * Builds the Gemini request body for a single base64-encoded image.
 * @param {string} base64Data - base64 image data (no data URI prefix)
 * @param {string} mimeType - image MIME type (e.g. 'image/jpeg')
 */
export function buildGeminiRequest(base64Data, mimeType) {
  return {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
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
}

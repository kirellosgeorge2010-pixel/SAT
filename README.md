# SAT Mistake Intelligence System 🎯🧠

A full-stack, cognitive diagnostic platform for the **Digital SAT** (Math and Reading & Writing) powered by **Gemini AI Vision & Reasoning**.

Rather than simply recording incorrect answers, this system diagnoses **WHY** you got each question wrong, detects cognitive misconceptions, flags adaptive **Module 1 vs Module 2 collapse**, calculates an evidence-based **Ranked Weakness Matrix**, prescribes **Personalized 3-Priority Study Actions**, and provides an interactive **Smart Retest Studio** and an **AI SAT Tutor Chatbot**.

---

## 🌟 Core Architectural Features

### 1. 📋 Cognitive Error Recording & Fast Data Entry
- **Dual-Channel Input**:
  - **Upload Screenshot / PDF**: Gemini 2.5 Vision automatically OCRs and extracts the question text, options A-D, your answer, the correct answer, tested domain/topic, root cause, and step-by-step resolution.
  - **Fast Manual Entry**: Quick form with autocomplete dropdowns for all official SAT domains, topics, difficulty levels (Easy/Medium/Hard), time spent (stopwatch/seconds), and root cause reflections.
  - **✨ In-Modal AI Auto-Diagnosis**: Type a question, click one button, and Gemini immediately populates the concept tested, root cause, misconceptions, and takeaway.

### 2. 🧠 Intelligent Error Classification (8 Standard Categories)
1. **Knowledge Gap** — Missing formula, rule, or vocabulary definition.
2. **Application Error** — Understood the rule in theory, but failed to apply it to the scenario.
3. **Misreading** — Missed prompt constraints (e.g. solved for $x$ instead of $2x+1$, missed "not", overlooked units).
4. **Calculation Error** — Sign slip ($+/-$), arithmetic, or calculator miskey.
5. **Time Management** — Rushed due to low time, or panicked after spending too long earlier.
6. **Careless Execution** — Unforced attention lapse or bubble selection error.
7. **Guessing** — No clear approach or ran out of time.
8. **Conceptual Misunderstanding** — Flawed mental model of the tested principle.

### 3. 📊 Performance & Adaptive Module Analytics
- **Module 1 vs Module 2 Adaptive Comparison**:
  - Automatically compares accuracy between Module 1 and Module 2.
  - Detects **Adaptive Module 2 Performance Drop** (>15% gap) when higher-difficulty questions and pacing stress cause unforced errors.
- **Section Split**: Math vs Reading & Writing accuracy breakdown.
- **Root Cause Distribution**: Interactive horizontal breakdown across all 8 error categories.
- **Topic Accuracy Matrix**: Full tracking of total logged, resolved, and recurring mistakes.
- **Statistical Confidence Safeguard**: Displays preliminary indicators when fewer than 5 questions are logged to prevent misleading conclusions.

### 4. 🎯 Weakness Detection Engine & Weighted Matrix
- **Evidence-Based Severity Formula**:
  $$\text{Score} = (\text{Unresolved} \times 2.0) + (\text{Repeated} \times 3.5) + (\text{Hard} \times 1.5) + (\text{Rule Application} \times 2.0) + (\text{Rushing} \times 1.5)$$
- Prevents single isolated questions from distorting rankings.
- Ranks topics by **Critical**, **High**, and **Moderate** severity.

### 5. 💡 Personalized AI Study Prescription
- **Top 3 High-Leverage Weaknesses** with diagnosed cognitive patterns.
- **Actionable Corrective Drills** tied directly to actual mistakes.
- **Suggested Focus for Your Next Study Session**.
- Direct links to re-attempt questions related to each weakness.

### 6. 🔄 Smart Review System & Retest Studio
- **Rigorous Resolution Rule**: A mistake only graduates to **"Fixed ✓"** after you successfully solve it independently!
- **Interactive Retest Session Mode**:
  - Hides previous answers and explanations.
  - Features an active elapsed-time stopwatch.
  - Interactive choice selection (A, B, C, D).
  - Immediate outcome validation:
    - If correct: Automatically promoted to **"Fixed ✓"** with celebration and logged in `retestHistory`.
    - If incorrect: Flagged as a critical **"Repeated Mistake ⚠"** with full AI diagnostic review.

### 7. 🤖 "Socrates-SAT" Contextual AI Chatbot
- Connected directly to your actual error log database and metrics.
- One-click prompt shortcuts:
  - *"Why do I keep getting these questions wrong?"*
  - *"What is my biggest weakness right now?"*
  - *"Why is my Module 2 performance worse than Module 1?"*
  - *"What should I study today?"*
  - *"Show me my repeated mistakes and how to fix them."*
  - *"Give me a similar practice question for my weakest topic."*

### 8. 🎨 UX & Theme Design
- **Dark Mode (Obsidian & Gold)** and **Light Mode (Clean Academic Ivory & Slate)** with seamless one-click toggle.
- Clean typography (Inter & JetBrains Mono).
- Persistent data storage via LocalStorage with full **JSON Import / Export Backup** and **CSV / Google Sheets Export**.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+ installed.

### 2. Run the Application
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

The system comes pre-loaded with a realistic SAT diagnostic seed dataset across both Math and Reading & Writing so you can explore all features right away. You can reset to demo data or clear everything anytime from the footer.

### 3. API Key Configuration
Your Gemini API key is configured in `.env`:
```env
VITE_GEMINI_API_KEY=your_key_here
```
The system uses `gemini-2.5-flash` with automatic fallback to `gemini-flash-latest`.

# SAT Error Log Assistant 📚

A sleek, dark-themed web app that uses **Gemini AI vision** to automatically parse SAT practice test images/PDFs, extract error data, and let you review, edit, and export a structured error log.

## Features

- 🖼️ **Drag & Drop Upload** — PDF, PNG, JPG, WebP support with live thumbnail previews
- 🤖 **Gemini AI Extraction** — Automatically identifies question number, section, correct/selected answer, domain, root cause, and takeaway
- ✏️ **Editable Review Table** — Inline editing, tag system, expand for full notes
- 📊 **Stats Dashboard** — Error count by section and root cause
- 📥 **CSV Export** — One-click download or clipboard copy
- 🟢 **Google Sheets Push** — OAuth2 integration to append rows directly to your sheet

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd SAT
npm install
```

### 2. Configure API Keys

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
# Required — get from https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_key_here

# Optional — for Google Sheets push
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Google Sheets Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Sheets API** and **Google Drive API**
4. Create **OAuth 2.0 Client ID** credentials (Web application type)
5. Add `http://localhost:5173` to **Authorized JavaScript Origins**
6. Copy the Client ID to your `.env`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| AI Vision | Gemini 1.5 Flash |
| PDF Parsing | PDF.js |
| Sheets Auth | Google Identity Services |
| Icons | Lucide React |

## Extracted Fields

| Field | Description |
|-------|-------------|
| Question Number | Q# from the test |
| Section | Math or Reading & Writing |
| Question Summary | Brief description of the prompt |
| Correct Answer | A / B / C / D |
| Selected Answer | What you chose |
| Domain | High-level SAT content area |
| Specific Topic | Sub-skill (e.g. "Linear equations") |
| Root Cause | Careless Error, Concept Breakdown, etc. |
| Explanation | AI-generated takeaway / correct approach |
| Tags | Custom labels you add |
| Notes | Personal study notes |

## Build for Production

```bash
npm run build
npm run preview
```

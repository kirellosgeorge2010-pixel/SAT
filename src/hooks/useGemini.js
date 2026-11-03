import { useState, useCallback } from 'react';
import { buildGeminiRequest } from '../utils/geminiPrompt';
import { pdfToImages } from '../utils/pdfToImages';

const GEMINI_MODEL = 'gemini-1.5-flash';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function getApiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
}

/**
 * Read a File as base64 string (for images).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini API with a single image (base64 + mimeType).
 * Returns parsed JSON array of entries.
 */
async function callGeminiVision(base64Data, mimeType) {
  const body = buildGeminiRequest(base64Data, mimeType);

  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Gemini returned empty response');

  // Strip possible markdown fences if model disobeys
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Gemini JSON response: ${cleaned.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response is not a JSON array');
  }

  return parsed;
}

/**
 * Generate a stable unique ID for each entry.
 */
function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Hook: useGemini
 * Provides processFiles() which takes an array of File objects,
 * calls Gemini for each, and appends results to the entries state.
 */
export function useGemini() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [error, setError] = useState(null);

  const processFiles = useCallback(async (files, onEntriesExtracted) => {
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Build a flat list of images to process
    const tasks = [];
    for (const file of files) {
      if (file.type === 'application/pdf') {
        tasks.push({ type: 'pdf', file });
      } else {
        tasks.push({ type: 'image', file });
      }
    }

    setProgress({ current: 0, total: tasks.length, label: 'Preparing files...' });

    const allEntries = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      setProgress({
        current: i + 1,
        total: tasks.length,
        label: `Processing "${task.file.name}"...`,
      });

      try {
        if (task.type === 'pdf') {
          // Convert PDF pages to images
          setProgress(p => ({ ...p, label: `Rendering PDF "${task.file.name}"...` }));
          const pages = await pdfToImages(task.file);

          for (const page of pages) {
            setProgress(p => ({
              ...p,
              label: `Analyzing "${task.file.name}" page ${page.pageNum}/${pages.length}...`,
            }));
            const entries = await callGeminiVision(page.base64, page.mimeType);
            for (const entry of entries) {
              allEntries.push({
                id: makeId(),
                sourceFile: task.file.name,
                sourcePage: page.pageNum,
                tags: [],
                customNotes: '',
                ...entry,
              });
            }
          }
        } else {
          const base64 = await fileToBase64(task.file);
          const mimeType = task.file.type || 'image/jpeg';
          const entries = await callGeminiVision(base64, mimeType);
          for (const entry of entries) {
            allEntries.push({
              id: makeId(),
              sourceFile: task.file.name,
              sourcePage: null,
              tags: [],
              customNotes: '',
              ...entry,
            });
          }
        }
      } catch (err) {
        console.error(`Error processing ${task.file.name}:`, err);
        // Add a placeholder error entry so the user knows something went wrong
        allEntries.push({
          id: makeId(),
          sourceFile: task.file.name,
          sourcePage: null,
          questionNumber: '?',
          section: 'Unknown',
          questionSummary: `⚠ Error processing this file: ${err.message}`,
          correctAnswer: 'Unknown',
          selectedAnswer: 'Unknown',
          domain: 'Unknown',
          specificTopic: '',
          rootCause: 'Unknown',
          explanation: '',
          tags: ['error'],
          customNotes: '',
          _hasError: true,
        });
      }
    }

    setIsProcessing(false);
    setProgress({ current: 0, total: 0, label: '' });
    onEntriesExtracted(allEntries);
  }, []);

  return { processFiles, isProcessing, progress, error, setError };
}

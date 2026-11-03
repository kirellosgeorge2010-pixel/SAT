import { INITIAL_SAT_MISTAKES } from './seedData';

const STORAGE_KEY = 'sat_mistake_intelligence_entries_v2';
const THEME_KEY = 'sat_theme_preference';

/**
 * Load all recorded mistakes from local storage.
 * Automatically initializes with high quality realistic seed mistakes if first load.
 */
export function loadMistakes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAT_MISTAKES));
      return INITIAL_SAT_MISTAKES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAT_MISTAKES;
  } catch (err) {
    console.error('Failed to load mistakes from localStorage:', err);
    return INITIAL_SAT_MISTAKES;
  }
}

/**
 * Save all mistakes to local storage.
 */
export function saveMistakes(mistakes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch (err) {
    console.error('Failed to save mistakes to localStorage:', err);
  }
}

/**
 * Reset dataset back to default realistic seed data.
 */
export function resetToSeedData() {
  saveMistakes(INITIAL_SAT_MISTAKES);
  return INITIAL_SAT_MISTAKES;
}

/**
 * Clear all data completely.
 */
export function clearAllData() {
  saveMistakes([]);
  return [];
}

/**
 * Export data as formatted JSON string.
 */
export function exportToJson(mistakes) {
  const jsonStr = JSON.stringify(mistakes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sat_mistake_intelligence_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported JSON file string and validate schema.
 */
export function parseImportedJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('File must contain an array of SAT mistakes');
  return parsed.map((item, idx) => ({
    id: item.id || `imported-${Date.now()}-${idx}`,
    date: item.date || new Date().toISOString().slice(0, 10),
    section: item.section || 'Math',
    module: item.module || 'Module 1',
    testName: item.testName || 'Practice Test',
    questionNumber: String(item.questionNumber || idx + 1),
    questionText: item.questionText || '',
    options: item.options || { A: '', B: '', C: '', D: '' },
    selectedAnswer: item.selectedAnswer || 'Unknown',
    correctAnswer: item.correctAnswer || 'Unknown',
    isCorrect: Boolean(item.isCorrect),
    difficulty: item.difficulty || 'Medium',
    timeSpentSeconds: Number(item.timeSpentSeconds) || 60,
    domain: item.domain || 'Algebra',
    topic: item.topic || 'General',
    subtopic: item.subtopic || '',
    errorCategory: item.errorCategory || 'Application Error',
    rootCause: item.rootCause || '',
    conceptTested: item.conceptTested || '',
    stepByStepSolution: Array.isArray(item.stepByStepSolution) ? item.stepByStepSolution : [],
    misconceptionsDetected: Array.isArray(item.misconceptionsDetected) ? item.misconceptionsDetected : [],
    knowsRuleStrugglesApplication: Boolean(item.knowsRuleStrugglesApplication),
    correctiveExercise: item.correctiveExercise || '',
    takeaway: item.takeaway || '',
    reviewStatus: item.reviewStatus || 'New Mistake',
    tags: Array.isArray(item.tags) ? item.tags : [],
    customNotes: item.customNotes || '',
    retestHistory: Array.isArray(item.retestHistory) ? item.retestHistory : [],
    createdAt: item.createdAt || Date.now(),
    updatedAt: Date.now(),
  }));
}

/**
 * Load theme preference: 'dark' or 'light'. Default is 'dark'.
 */
export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Save theme preference: 'dark' or 'light'.
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

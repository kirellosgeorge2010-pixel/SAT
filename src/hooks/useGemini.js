import { useState, useCallback } from 'react';
import { analyzeQuestionImage, getEffectiveApiKey } from '../utils/geminiIntelligence';
import { pdfToImages } from '../utils/pdfToImages';

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

function makeId() {
  return 'sat-' + Math.random().toString(36).slice(2, 9) + '-' + Date.now().toString(36);
}

/**
 * Hook: useGemini
 * Provides automated extraction from uploaded PDFs and images with progress reporting.
 */
export function useGemini() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [error, setError] = useState(null);

  const processFiles = useCallback(async (files, onEntriesExtracted) => {
    const activeKey = getEffectiveApiKey();
    if (!activeKey) {
      setError('Gemini API key not configured. Open Key Settings in the top bar to set your key.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const tasks = [];
    for (const file of files) {
      if (file.type === 'application/pdf') {
        tasks.push({ type: 'pdf', file });
      } else {
        tasks.push({ type: 'image', file });
      }
    }

    setProgress({ current: 0, total: tasks.length, label: 'Preparing files for AI inspection...' });
    const allMistakes = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      setProgress({
        current: i + 1,
        total: tasks.length,
        label: `Scanning & analyzing "${task.file.name}"...`,
      });

      try {
        if (task.type === 'pdf') {
          setProgress(p => ({ ...p, label: `Rendering PDF pages for "${task.file.name}"...` }));
          const pages = await pdfToImages(task.file);

          for (const page of pages) {
            setProgress(p => ({
              ...p,
              label: `AI Vision analyzing "${task.file.name}" page ${page.pageNum}/${pages.length}...`,
            }));

            const extractedItems = await analyzeQuestionImage(page.base64, page.mimeType);

            for (const item of extractedItems) {
              allMistakes.push({
                id: makeId(),
                date: new Date().toISOString().slice(0, 10),
                testName: task.file.name.replace(/\.[^/.]+$/, ''),
                section: item.section || 'Math',
                module: item.module || 'Module 1',
                questionNumber: String(item.questionNumber || 'Q'),
                difficulty: item.difficulty || 'Medium',
                timeSpentSeconds: 60,
                domain: item.domain || 'Algebra',
                topic: item.topic || 'General Topic',
                subtopic: item.subtopic || '',
                questionText: item.questionText || '',
                options: item.options || { A: '', B: '', C: '', D: '' },
                selectedAnswer: item.selectedAnswer || 'Unknown',
                correctAnswer: item.correctAnswer || 'Unknown',
                isCorrect: item.selectedAnswer && item.correctAnswer ? item.selectedAnswer === item.correctAnswer : false,
                errorCategory: item.errorCategory || 'Application Error',
                rootCause: item.rootCause || '',
                conceptTested: item.conceptTested || '',
                stepByStepSolution: Array.isArray(item.stepByStepSolution) ? item.stepByStepSolution : [],
                misconceptionsDetected: Array.isArray(item.misconceptionsDetected) ? item.misconceptionsDetected : [],
                knowsRuleStrugglesApplication: Boolean(item.knowsRuleStrugglesApplication),
                correctiveExercise: item.correctiveExercise || '',
                takeaway: item.takeaway || '',
                reviewStatus: 'Analyzed',
                tags: [item.section?.toLowerCase() || 'sat'],
                customNotes: `Extracted from PDF ${task.file.name} (page ${page.pageNum})`,
                questionImage: `data:image/jpeg;base64,${page.base64}`,
                retestHistory: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        } else {
          const base64 = await fileToBase64(task.file);
          const mimeType = task.file.type || 'image/jpeg';
          const extractedItems = await analyzeQuestionImage(base64, mimeType);

          for (const item of extractedItems) {
            allMistakes.push({
              id: makeId(),
              date: new Date().toISOString().slice(0, 10),
              testName: task.file.name.replace(/\.[^/.]+$/, ''),
              section: item.section || 'Math',
              module: item.module || 'Module 1',
              questionNumber: String(item.questionNumber || 'Q'),
              difficulty: item.difficulty || 'Medium',
              timeSpentSeconds: 60,
              domain: item.domain || 'Algebra',
              topic: item.topic || 'General Topic',
              subtopic: item.subtopic || '',
              questionText: item.questionText || '',
              options: item.options || { A: '', B: '', C: '', D: '' },
              selectedAnswer: item.selectedAnswer || 'Unknown',
              correctAnswer: item.correctAnswer || 'Unknown',
              isCorrect: item.selectedAnswer && item.correctAnswer ? item.selectedAnswer === item.correctAnswer : false,
              errorCategory: item.errorCategory || 'Application Error',
              rootCause: item.rootCause || '',
              conceptTested: item.conceptTested || '',
              stepByStepSolution: Array.isArray(item.stepByStepSolution) ? item.stepByStepSolution : [],
              misconceptionsDetected: Array.isArray(item.misconceptionsDetected) ? item.misconceptionsDetected : [],
              knowsRuleStrugglesApplication: Boolean(item.knowsRuleStrugglesApplication),
              correctiveExercise: item.correctiveExercise || '',
              takeaway: item.takeaway || '',
              reviewStatus: 'Analyzed',
              tags: [item.section?.toLowerCase() || 'sat'],
              customNotes: `Extracted from ${task.file.name}`,
              questionImage: `data:${mimeType};base64,${base64}`,
              retestHistory: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      } catch (err) {
        console.error(`Error processing file ${task.file.name}:`, err);
        setError(`Failed to analyze ${task.file.name}: ${err.message}`);
      }
    }

    setIsProcessing(false);
    setProgress({ current: 0, total: 0, label: '' });

    if (allMistakes.length > 0) {
      onEntriesExtracted(allMistakes);
    }
  }, []);

  return { processFiles, isProcessing, progress, error, setError };
}

/**
 * CSV and Google Sheets export utility for SAT Mistake Intelligence System.
 */

const HEADERS = [
  'Date',
  'Test Name',
  'Section',
  'Module',
  'Question Number',
  'Difficulty',
  'Time Spent (sec)',
  'My Answer',
  'Correct Answer',
  'Domain',
  'Topic',
  'Subtopic',
  'Error Category',
  'Root Cause',
  'Concept Tested',
  'Personal Takeaway',
  'Review Status',
  'Tags',
  'Custom Notes',
];

function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of mistake entries to a CSV string.
 */
export function entriesToCsv(entries) {
  const rows = [HEADERS.join(',')];

  for (const entry of entries) {
    const row = [
      entry.date || '',
      entry.testName || '',
      entry.section || '',
      entry.module || '',
      entry.questionNumber || '',
      entry.difficulty || '',
      entry.timeSpentSeconds || '',
      entry.selectedAnswer || '',
      entry.correctAnswer || '',
      entry.domain || '',
      entry.topic || '',
      entry.subtopic || '',
      entry.errorCategory || '',
      entry.rootCause || '',
      entry.conceptTested || '',
      entry.takeaway || '',
      entry.reviewStatus || '',
      (entry.tags || []).join('; '),
      entry.customNotes || '',
    ].map(escapeCsv);

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Trigger CSV download in browser.
 */
export function downloadCsv(csvContent, filename = 'sat_mistake_intelligence_log.csv') {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert entries to Google Sheets API 2D array.
 */
export function entriesToSheetRows(entries) {
  const rows = [HEADERS];
  for (const entry of entries) {
    rows.push([
      entry.date || '',
      entry.testName || '',
      entry.section || '',
      entry.module || '',
      entry.questionNumber || '',
      entry.difficulty || '',
      String(entry.timeSpentSeconds || ''),
      entry.selectedAnswer || '',
      entry.correctAnswer || '',
      entry.domain || '',
      entry.topic || '',
      entry.subtopic || '',
      entry.errorCategory || '',
      entry.rootCause || '',
      entry.conceptTested || '',
      entry.takeaway || '',
      entry.reviewStatus || '',
      (entry.tags || []).join('; '),
      entry.customNotes || '',
    ]);
  }
  return rows;
}

/**
 * CSV export utility for SAT Error Log entries.
 */

const HEADERS = [
  'Question Number',
  'Section',
  'Question Summary',
  'Correct Answer',
  'Selected Answer',
  'Domain',
  'Specific Topic',
  'Root Cause',
  'Explanation / Takeaway',
  'Custom Notes',
  'Tags',
];

function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if contains comma, newline, or quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of error log entries to a CSV string.
 * @param {Array<Object>} entries
 * @returns {string} CSV content
 */
export function entriesToCsv(entries) {
  const rows = [HEADERS.join(',')];

  for (const entry of entries) {
    const row = [
      entry.questionNumber,
      entry.section,
      entry.questionSummary,
      entry.correctAnswer,
      entry.selectedAnswer,
      entry.domain,
      entry.specificTopic,
      entry.rootCause,
      entry.explanation,
      entry.customNotes || '',
      (entry.tags || []).join('; '),
    ].map(escapeCsv);

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 * @param {string} csvContent
 * @param {string} filename
 */
export function downloadCsv(csvContent, filename = 'sat_error_log.csv') {
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
 * Convert entries to Google Sheets API valueRange format.
 * @param {Array<Object>} entries
 * @returns {Array<Array<string>>} 2D array for Sheets API
 */
export function entriesToSheetRows(entries) {
  const rows = [HEADERS];
  for (const entry of entries) {
    rows.push([
      entry.questionNumber || '',
      entry.section || '',
      entry.questionSummary || '',
      entry.correctAnswer || '',
      entry.selectedAnswer || '',
      entry.domain || '',
      entry.specificTopic || '',
      entry.rootCause || '',
      entry.explanation || '',
      entry.customNotes || '',
      (entry.tags || []).join('; '),
    ]);
  }
  return rows;
}

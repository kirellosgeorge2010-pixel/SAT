/**
 * Converts a PDF file into an array of base64-encoded JPEG images (one per page)
 * using PDF.js running in the browser.
 */

let pdfjsLib = null;

async function getPdfjsLib() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import('pdfjs-dist');
  pdfjsLib = mod;
  // Point worker to CDN to avoid bundler issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

/**
 * @param {File} pdfFile - The PDF File object
 * @param {number} scale - Render scale (2 = 2x resolution, good for OCR)
 * @returns {Promise<Array<{base64: string, mimeType: string, pageNum: number}>>}
 */
export async function pdfToImages(pdfFile, scale = 2.0) {
  const lib = await getPdfjsLib();
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const results = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert canvas to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = dataUrl.split(',')[1];

    results.push({
      base64,
      mimeType: 'image/jpeg',
      pageNum,
    });
  }

  return results;
}

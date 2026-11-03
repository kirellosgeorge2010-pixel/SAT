/**
 * Converts a PDF file into an array of base64-encoded JPEG images (one per page)
 * using PDF.js loaded reliably from CDN without bundler chunk errors.
 */

let pdfjsLoadingPromise = null;

function loadPdfJs() {
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return Promise.resolve(window.pdfjsLib);
  }
  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;

    script.onload = () => {
      const lib = window.pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js library failed to initialize.'));
      }
    };

    script.onerror = () => {
      pdfjsLoadingPromise = null;
      reject(new Error('Could not download PDF.js library from CDN. Please check your internet connection.'));
    };

    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
}

/**
 * @param {File} pdfFile - The PDF File object
 * @param {number} scale - Render scale (2 = 2x resolution, ideal for SAT OCR)
 * @returns {Promise<Array<{base64: string, mimeType: string, pageNum: number}>>}
 */
export async function pdfToImages(pdfFile, scale = 2.0) {
  const lib = await loadPdfJs();
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

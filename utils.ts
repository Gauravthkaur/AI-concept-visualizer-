// utils.ts
// This file is being kept for now in case simple file download utilities are needed in the future,
// but its 'downloadFile' function is not currently used by App.tsx for diagram downloads
// as PDF generation is handled directly there.

/**
 * Triggers a file download in the browser.
 * @param content The content of the file (string) or a data URL.
 * @param fileName The desired name for the downloaded file.
 * @param mimeType The MIME type of the file (e.g., 'image/png', 'image/svg+xml', 'text/plain'). Defaults to 'application/octet-stream'.
 */
export const downloadFile = (content: string, fileName: string, mimeType: string = 'application/octet-stream') => {
  const isDataUrl = content.startsWith('data:');
  
  let blob: Blob | null = null;
  if (!isDataUrl) {
    blob = new Blob([content], { type: mimeType });
  }
  
  const url = isDataUrl ? content : URL.createObjectURL(blob!);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  if (!isDataUrl && url) {
    URL.revokeObjectURL(url);
  }
};

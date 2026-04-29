// Generic blob download helper. Used by HTML, JSON, and PDF export paths.

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke shortly after the click so the browser has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text: string, filename: string, mime: string): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

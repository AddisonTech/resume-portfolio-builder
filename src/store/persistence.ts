import type { ResumeData } from '../types';

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — fail silently
  }
}

export function downloadJson(data: ResumeData, filename = 'resume.json'): void {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function loadJsonFile(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = JSON.parse(text) as ResumeData;
        resolve(parsed);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Invalid JSON'));
      }
    };
    reader.readAsText(file);
  });
}

import type { ResumeData } from '../types';
import {
  buildExportEnvelope,
  migratePersisted,
  parseImportedJson,
  type PersistedEnvelope,
} from './migrations';

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

// Schema-aware persisted-state loader. Returns null if the stored blob is
// missing, malformed, or fails validation — caller falls back to defaults.
export function loadPersistedEnvelope(key: string): PersistedEnvelope | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return migratePersisted(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function downloadJson(data: ResumeData, filename = 'resume.json'): void {
  const text = JSON.stringify(buildExportEnvelope(data), null, 2);
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
        const parsed = parseImportedJson(JSON.parse(text));
        if (!parsed) {
          reject(new Error('JSON does not match the resume schema'));
          return;
        }
        resolve(parsed);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Invalid JSON'));
      }
    };
    reader.readAsText(file);
  });
}

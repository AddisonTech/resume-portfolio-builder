// Schema versioning + validation for persisted state and JSON exports.
// Persisted envelope adds an explicit `version` so future schema changes
// can migrate forward instead of silently corrupting old data.

import type { ResumeData, TemplateName } from '../types';
import { defaultResume } from './defaults';

export const PERSIST_VERSION = 2;
export const EXPORT_VERSION = 1;
export const EXPORT_SCHEMA = 'resume-portfolio-builder';

export type Density = 'normal' | 'compact';

export interface PersistedEnvelope {
  version: number;
  data: ResumeData;
  template: TemplateName;
  accent: string;
  darkMode: boolean;
  density: Density;
}

export interface ExportEnvelope {
  schema: typeof EXPORT_SCHEMA;
  version: number;
  exportedAt: string;
  data: ResumeData;
}

const TEMPLATES: ReadonlySet<TemplateName> = new Set(['Modern', 'Classic', 'Minimal']);

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isString(x: unknown): x is string {
  return typeof x === 'string';
}

function isStringRecord(x: unknown, keys: readonly string[]): boolean {
  if (!isObject(x)) return false;
  return keys.every((k) => isString(x[k]));
}

const PERSONAL_KEYS = [
  'name',
  'title',
  'email',
  'phone',
  'location',
  'linkedin',
  'github',
  'website',
  'summary',
] as const;
const EDU_KEYS = [
  'degree',
  'field',
  'institution',
  'location',
  'start_year',
  'end_year',
  'gpa',
  'honors',
  'relevant_courses',
] as const;
const EXP_STR_KEYS = [
  'company',
  'position',
  'location',
  'start_date',
  'end_date',
  'description',
  'achievements',
] as const;
const PROJ_KEYS = [
  'name',
  'description',
  'tech',
  'github_url',
  'live_url',
  'highlights',
] as const;
const CERT_KEYS = ['name', 'issuer', 'date', 'url'] as const;

export function validateResumeData(x: unknown): x is ResumeData {
  if (!isObject(x)) return false;
  if (!isStringRecord(x.personal, PERSONAL_KEYS)) return false;

  if (!Array.isArray(x.education) || !x.education.every((e) => isStringRecord(e, EDU_KEYS))) {
    return false;
  }

  if (
    !Array.isArray(x.experience) ||
    !x.experience.every((e) => isStringRecord(e, EXP_STR_KEYS) && typeof (e as Record<string, unknown>).current === 'boolean')
  ) {
    return false;
  }

  if (!isObject(x.skills) || !Array.isArray(x.skills.categories)) return false;
  if (!x.skills.categories.every((c) => isStringRecord(c, ['name', 'items']))) return false;

  if (!Array.isArray(x.projects) || !x.projects.every((p) => isStringRecord(p, PROJ_KEYS))) {
    return false;
  }

  if (!Array.isArray(x.certifications) || !x.certifications.every((c) => isStringRecord(c, CERT_KEYS))) {
    return false;
  }

  return true;
}

function asTemplate(x: unknown): TemplateName {
  return isString(x) && TEMPLATES.has(x as TemplateName) ? (x as TemplateName) : 'Modern';
}

function asAccent(x: unknown): string {
  return isString(x) && /^#[0-9a-fA-F]{6}$/.test(x) ? x : '#22d3ee';
}

function asDensity(x: unknown): Density {
  return x === 'compact' ? 'compact' : 'normal';
}

// Migrate any prior persistence shape forward to the current envelope.
// v1 was untagged: { data, template, accent, darkMode }.
// Pre-v1 (early prototypes) may have stored bare ResumeData.
export function migratePersisted(raw: unknown): PersistedEnvelope | null {
  if (!isObject(raw)) {
    if (validateResumeData(raw)) return safeDefaultEnvelope(raw);
    return null;
  }

  // Tagged envelope (v2+) — accept any version that round-trips through validation.
  if (typeof raw.version === 'number' && validateResumeData(raw.data)) {
    return {
      version: PERSIST_VERSION,
      data: raw.data,
      template: asTemplate(raw.template),
      accent: asAccent(raw.accent),
      darkMode: typeof raw.darkMode === 'boolean' ? raw.darkMode : true,
      density: asDensity(raw.density),
    };
  }

  // Untagged v1 shape.
  if ('data' in raw && validateResumeData(raw.data)) {
    return {
      version: PERSIST_VERSION,
      data: raw.data,
      template: asTemplate(raw.template),
      accent: asAccent(raw.accent),
      darkMode: typeof raw.darkMode === 'boolean' ? raw.darkMode : true,
      density: 'normal',
    };
  }

  // Bare ResumeData (very old).
  if (validateResumeData(raw)) return safeDefaultEnvelope(raw);

  return null;
}

// Accept either a versioned ExportEnvelope or a bare ResumeData (legacy
// Streamlit-era files). Returns null on invalid shape.
export function parseImportedJson(raw: unknown): ResumeData | null {
  if (validateResumeData(raw)) return raw;
  if (isObject(raw) && validateResumeData(raw.data)) return raw.data as ResumeData;
  return null;
}

export function buildExportEnvelope(data: ResumeData): ExportEnvelope {
  return {
    schema: EXPORT_SCHEMA,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function safeDefaultEnvelope(data: ResumeData = defaultResume()): PersistedEnvelope {
  return {
    version: PERSIST_VERSION,
    data,
    template: 'Modern',
    accent: '#22d3ee',
    darkMode: true,
    density: 'normal',
  };
}

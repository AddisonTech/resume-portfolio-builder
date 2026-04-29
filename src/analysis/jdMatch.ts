// JD keyword matcher. Ported from jd_match.py.
//
// Tokenization preserves tech symbols (+, #, ., -, /). Bigrams are kept only
// when they appear at least twice. Final score weights phrases 1.6x, with a
// small length bonus on long words.
//
// IMPORTANT: JS \b does not match Python \b for tokens with `+`, `#`, `.`.
// We replicate the Python (?<![a-z0-9])TERM(?![a-z0-9]) pattern using JS
// lookbehind + lookahead (modern Node/browsers support both).

import type { ResumeData } from '../types';
import { STOPWORDS } from './stopwords';

const MIN_TOKEN_LEN = 2;

const KEEP_PATTERNS: RegExp[] = [
  /^[a-z]\+\+?$/, // c, c++
  /^[a-z]#$/,     // c#
  /^\d+[a-z]+$/,  // 3d, 2d
];

const TOKEN_RE = /[a-zA-Z][a-zA-Z0-9+#./-]*/g;

export interface Keyword {
  term: string;
  count: number;
  kind: 'word' | 'phrase';
  weight: number;
}

export interface MatchResult {
  score: number;
  matched: Keyword[];
  missing: Keyword[];
  totalKw: number;
  matchedKw: number;
  jdExcerpt: string;
}

function stripEdges(tok: string): string {
  // Mirror Python's tok.strip(".-/")
  let start = 0;
  let end = tok.length;
  while (start < end && '.-/'.includes(tok[start])) start += 1;
  while (end > start && '.-/'.includes(tok[end - 1])) end -= 1;
  return tok.slice(start, end);
}

export function tokenize(text: string): string[] {
  const out: string[] = [];
  const src = text ?? '';
  for (const m of src.matchAll(TOKEN_RE)) {
    const raw = m[0].toLowerCase();
    const tok = stripEdges(raw);
    if (!tok) continue;
    if (STOPWORDS.has(tok)) continue;
    if (tok.length < MIN_TOKEN_LEN && !KEEP_PATTERNS.some((p) => p.test(tok))) continue;
    out.push(tok);
  }
  return out;
}

export function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    out.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return out;
}

function counter(items: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return m;
}

function mostCommon(c: Map<string, number>, n: number): Array<[string, number]> {
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function extractJdKeywords(
  jdText: string,
  maxUnigrams = 30,
  maxBigrams = 12,
): Keyword[] {
  const text = (jdText ?? '').trim();
  if (!text) return [];

  const toks = tokenize(text);
  const uni = counter(toks);
  let bi = counter(bigrams(toks));

  // Bigrams only matter if they appear at least twice.
  bi = new Map([...bi.entries()].filter(([phrase, c]) => c >= 2 && phrase.split(' ').length === 2));

  const out: Keyword[] = [];
  for (const [term, count] of mostCommon(uni, maxUnigrams)) {
    out.push({
      term,
      count,
      kind: 'word',
      weight: count * (1 + 0.15 * (term.length >= 5 ? 1 : 0)),
    });
  }
  for (const [term, count] of mostCommon(bi, maxBigrams)) {
    out.push({ term, count, kind: 'phrase', weight: count * 1.6 });
  }

  // Drop unigrams already covered by a phrase to avoid double-counting.
  const bigramWords = new Set<string>();
  for (const kw of out) {
    if (kw.kind === 'phrase') {
      for (const part of kw.term.split(' ')) bigramWords.add(part);
    }
  }
  const filtered = out.filter((kw) => kw.kind === 'phrase' || !bigramWords.has(kw.term));

  filtered.sort((a, b) => b.weight - a.weight);
  return filtered;
}

export function buildResumeCorpus(data: ResumeData): string {
  const parts: string[] = [];
  const p = data.personal;
  parts.push(p.title ?? '');
  parts.push(p.summary ?? '');

  for (const exp of data.experience ?? []) {
    parts.push(exp.position ?? '');
    parts.push(exp.company ?? '');
    parts.push(exp.description ?? '');
    parts.push(exp.achievements ?? '');
  }

  for (const cat of data.skills?.categories ?? []) {
    parts.push(cat.name ?? '');
    parts.push(cat.items ?? '');
  }

  for (const proj of data.projects ?? []) {
    parts.push(proj.name ?? '');
    parts.push(proj.description ?? '');
    parts.push(proj.highlights ?? '');
    parts.push(proj.tech ?? '');
  }

  for (const cert of data.certifications ?? []) {
    parts.push(cert.name ?? '');
    parts.push(cert.issuer ?? '');
  }

  return parts.filter((x) => x).join('\n');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function termPresent(term: string, corpusLower: string): boolean {
  // Mirrors Python: (?<![a-z0-9])TERM(?![a-z0-9])
  const safe = escapeRegex(term);
  const re = new RegExp(`(?<![a-z0-9])${safe}(?![a-z0-9])`);
  return re.test(corpusLower);
}

export function matchResume(
  data: ResumeData,
  jdText: string,
  topMissing = 8,
): MatchResult {
  const keywords = extractJdKeywords(jdText);
  if (keywords.length === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
      totalKw: 0,
      matchedKw: 0,
      jdExcerpt: '',
    };
  }

  const corpus = buildResumeCorpus(data).toLowerCase();

  const matched: Keyword[] = [];
  const missing: Keyword[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const kw of keywords) {
    totalWeight += kw.weight;
    if (termPresent(kw.term, corpus)) {
      matched.push(kw);
      matchedWeight += kw.weight;
    } else {
      missing.push(kw);
    }
  }

  const rawScore = totalWeight ? Math.round((100 * matchedWeight) / totalWeight) : 0;
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    matched,
    missing: missing.slice(0, topMissing),
    totalKw: keywords.length,
    matchedKw: matched.length,
    jdExcerpt: (jdText ?? '').trim().slice(0, 200),
  };
}

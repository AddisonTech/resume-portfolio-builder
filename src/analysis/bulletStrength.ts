// Bullet strength analyzer. Ported from analyzers.py — same scoring math:
//   has_number  : digit OR english number word
//   has_verb    : first word (alpha + apostrophe only, lowercased) is in ACTION_VERBS
//   length_ok   : 30 <= length <= 200
// score = sum of the three booleans (0–3).

import { ACTION_VERBS } from './actionVerbs';

const NUMBER_RE =
  /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|billion)\b/i;

export interface BulletAnalysis {
  text: string;
  length: number;
  firstWord: string;
  hasNumber: boolean;
  hasVerb: boolean;
  lengthOk: boolean;
  score: number;
}

export function analyzeBullet(line: string): BulletAnalysis {
  const trimmed = (line ?? '').trim();
  const length = trimmed.length;

  // First whitespace-separated token — strip everything except letters and apostrophes.
  let firstWord = '';
  const tokens = trimmed.split(/\s+/);
  for (const tok of tokens) {
    if (tok) {
      firstWord = tok.replace(/[^A-Za-z']/g, '').toLowerCase();
      break;
    }
  }

  const hasNumber = NUMBER_RE.test(trimmed);
  const hasVerb = ACTION_VERBS.has(firstWord);
  const lengthOk = length >= 30 && length <= 200;

  const score = (hasNumber ? 1 : 0) + (hasVerb ? 1 : 0) + (lengthOk ? 1 : 0);

  return {
    text: trimmed,
    length,
    firstWord,
    hasNumber,
    hasVerb,
    lengthOk,
    score,
  };
}

export function analyzeAchievementsBlock(text: string): BulletAnalysis[] {
  const out: BulletAnalysis[] = [];
  for (const line of (text ?? '').split('\n')) {
    const s = line.trim();
    if (!s) continue;
    out.push(analyzeBullet(s));
  }
  return out;
}

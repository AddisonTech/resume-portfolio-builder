// Resume health score. Direct port of score_resume_health() in analyzers.py.
// 8 buckets, total 100 points (15+10+10+25+15+10+10+5).

import type { ResumeData } from '../types';
import { analyzeAchievementsBlock, type BulletAnalysis } from './bulletStrength';

export interface HealthRow {
  label: string;
  pts: number;
  max: number;
  note: string;
}

export interface HealthReport {
  score: number;
  breakdown: HealthRow[];
}

function allBullets(data: ResumeData): BulletAnalysis[] {
  const out: BulletAnalysis[] = [];
  for (const exp of data.experience ?? []) {
    out.push(...analyzeAchievementsBlock(exp.achievements ?? ''));
  }
  for (const proj of data.projects ?? []) {
    out.push(...analyzeAchievementsBlock(proj.highlights ?? ''));
  }
  return out;
}

export function scoreResumeHealth(data: ResumeData): HealthReport {
  const p = data.personal ?? {
    name: '', title: '', email: '', phone: '', location: '',
    linkedin: '', github: '', website: '', summary: '',
  };
  const breakdown: HealthRow[] = [];

  // 1. Personal completeness (15)
  const personalFields = [p.name, p.email, p.title, p.summary];
  const filled = personalFields.reduce((acc, v) => acc + ((v ?? '').trim() ? 1 : 0), 0);
  const pts1 = Math.round((15 * filled) / 4);
  breakdown.push({
    label: 'Personal completeness',
    pts: pts1,
    max: 15,
    note: `${filled}/4 of name, email, title, summary`,
  });

  // 2. Summary quality (10)
  const s = (p.summary ?? '').trim();
  let pts2: number;
  let note2: string;
  if (s.length >= 200 && s.length <= 600) {
    pts2 = 10;
    note2 = `${s.length} chars (sweet spot)`;
  } else if ((s.length >= 100 && s.length < 200) || (s.length > 600 && s.length <= 800)) {
    pts2 = 6;
    note2 = `${s.length} chars (close to sweet spot 200-600)`;
  } else if (s.length > 0) {
    pts2 = 3;
    note2 = `${s.length} chars (target 200-600)`;
  } else {
    pts2 = 0;
    note2 = 'empty';
  }
  breakdown.push({ label: 'Summary quality', pts: pts2, max: 10, note: note2 });

  // 3. Experience present (10)
  const exps = (data.experience ?? []).filter(
    (e) => (e.company ?? '').trim() && (e.position ?? '').trim(),
  );
  const pts3 = exps.length ? 10 : 0;
  breakdown.push({
    label: 'Experience present',
    pts: pts3,
    max: 10,
    note: `${exps.length} entry/entries`,
  });

  // Bullets used by 4, 5, 8.
  const bullets = allBullets(data);
  const nb = bullets.length;

  // 4. Achievements quantified (25)
  let pts4: number;
  let note4: string;
  if (nb) {
    const frac = bullets.filter((b) => b.hasNumber).length / nb;
    pts4 = Math.round(25 * frac);
    note4 = `${Math.floor(frac * 100)}% of ${nb} bullets contain numbers`;
  } else {
    pts4 = 0;
    note4 = 'no bullets';
  }
  breakdown.push({ label: 'Achievements quantified', pts: pts4, max: 25, note: note4 });

  // 5. Action verbs (15)
  let pts5: number;
  let note5: string;
  if (nb) {
    const frac = bullets.filter((b) => b.hasVerb).length / nb;
    pts5 = Math.round(15 * frac);
    note5 = `${Math.floor(frac * 100)}% start with a strong verb`;
  } else {
    pts5 = 0;
    note5 = 'no bullets';
  }
  breakdown.push({ label: 'Action verbs', pts: pts5, max: 15, note: note5 });

  // 6. Skills depth (10)
  const cats = (data.skills?.categories ?? []).filter((c) => c.name || c.items);
  const distinct = new Set<string>();
  for (const c of cats) {
    for (const item of (c.items ?? '').split(/[,/;|]/)) {
      const it = item.trim().toLowerCase();
      if (it) distinct.add(it);
    }
  }
  let pts6: number;
  if (cats.length >= 3 || distinct.size >= 10) pts6 = 10;
  else if (cats.length >= 2 || distinct.size >= 5) pts6 = 6;
  else if (cats.length) pts6 = 3;
  else pts6 = 0;
  breakdown.push({
    label: 'Skills depth',
    pts: pts6,
    max: 10,
    note: `${cats.length} categories, ${distinct.size} distinct items`,
  });

  // 7. Projects / Certs (10)
  const nProj = (data.projects ?? []).filter((x) => (x.name ?? '').trim()).length;
  const nCert = (data.certifications ?? []).filter((x) => (x.name ?? '').trim()).length;
  let pts7: number;
  if (nProj >= 1 || nCert >= 2) pts7 = 10;
  else if (nCert >= 1) pts7 = 5;
  else pts7 = 0;
  breakdown.push({
    label: 'Projects / Certs',
    pts: pts7,
    max: 10,
    note: `${nProj} project(s), ${nCert} cert(s)`,
  });

  // 8. Bullet length sanity (5)
  let pts8: number;
  let note8: string;
  if (nb) {
    const frac = bullets.filter((b) => b.length <= 200).length / nb;
    pts8 = Math.round(5 * frac);
    note8 = `${Math.floor(frac * 100)}% of bullets <= 200 chars`;
  } else {
    pts8 = 0;
    note8 = 'no bullets';
  }
  breakdown.push({ label: 'Bullet length', pts: pts8, max: 5, note: note8 });

  const total = breakdown.reduce((acc, row) => acc + row.pts, 0);
  return { score: total, breakdown };
}

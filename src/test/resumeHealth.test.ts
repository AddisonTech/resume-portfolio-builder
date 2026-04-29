import { describe, expect, it } from 'vitest';
import { defaultResume } from '../store/defaults';
import { sampleResume } from '../store/sample';
import { scoreResumeHealth } from '../analysis/resumeHealth';

describe('scoreResumeHealth', () => {
  it('scores an empty resume at 0/100', () => {
    const r = scoreResumeHealth(defaultResume());
    expect(r.score).toBe(0);
    expect(r.breakdown).toHaveLength(8);
    expect(r.breakdown.reduce((a, x) => a + x.max, 0)).toBe(100);
  });

  it('scores the sample resume in the strong band', () => {
    const r = scoreResumeHealth(sampleResume());
    // Sample has: 4/4 personal, 220-char summary, 2 exps, mostly quantified bullets,
    // strong action verbs, 4 skill categories with many items, 1 project + 2 certs.
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('breakdown labels are stable and sum to score', () => {
    const r = scoreResumeHealth(sampleResume());
    const labels = r.breakdown.map((b) => b.label);
    expect(labels).toEqual([
      'Personal completeness',
      'Summary quality',
      'Experience present',
      'Achievements quantified',
      'Action verbs',
      'Skills depth',
      'Projects / Certs',
      'Bullet length',
    ]);
    const sum = r.breakdown.reduce((a, x) => a + x.pts, 0);
    expect(sum).toBe(r.score);
  });
});

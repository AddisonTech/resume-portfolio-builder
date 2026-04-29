import { describe, expect, it } from 'vitest';
import { analyzeAchievementsBlock, analyzeBullet } from '../analysis/bulletStrength';

describe('analyzeBullet', () => {
  it('flags weak filler bullet (no verb, no number, too short)', () => {
    const a = analyzeBullet('Worked on the team');
    expect(a.hasVerb).toBe(false);
    expect(a.hasNumber).toBe(false);
    expect(a.lengthOk).toBe(false);
    expect(a.score).toBe(0);
  });

  it('scores a perfect bullet (verb + number + length)', () => {
    const a = analyzeBullet('Led migration of 12 services to Go, reducing latency 47%');
    expect(a.hasVerb).toBe(true);
    expect(a.hasNumber).toBe(true);
    expect(a.lengthOk).toBe(true);
    expect(a.score).toBe(3);
  });

  it('counts a verb + number but not length when bullet is too short', () => {
    const a = analyzeBullet('Reduced p99 latency 47%');
    expect(a.hasVerb).toBe(true);
    expect(a.hasNumber).toBe(true);
    expect(a.lengthOk).toBe(false);
    expect(a.length).toBe(23);
    expect(a.score).toBe(2);
  });

  it('detects english number words', () => {
    const a = analyzeBullet('Mentored four junior engineers across two product teams reliably');
    expect(a.hasNumber).toBe(true);
    expect(a.hasVerb).toBe(true);
    expect(a.lengthOk).toBe(true);
  });

  it('strips punctuation when reading the first word', () => {
    const a = analyzeBullet('"Built" a 24/7 monitoring system used by 30 engineers daily');
    expect(a.firstWord).toBe('built');
    expect(a.hasVerb).toBe(true);
  });

  it('treats empty input as zero everywhere', () => {
    const a = analyzeBullet('');
    expect(a.length).toBe(0);
    expect(a.score).toBe(0);
    expect(a.firstWord).toBe('');
  });

  it('flags an over-long bullet as not length-ok', () => {
    const long = 'Led ' + 'work '.repeat(60).trim();
    const a = analyzeBullet(long);
    expect(a.length).toBeGreaterThan(200);
    expect(a.lengthOk).toBe(false);
  });
});

describe('analyzeAchievementsBlock', () => {
  it('returns one analysis per non-empty line', () => {
    const block = `Led the team\n\nReduced p99 latency by 47%\n   \nMigrated services`;
    const out = analyzeAchievementsBlock(block);
    expect(out).toHaveLength(3);
    expect(out[0].text).toBe('Led the team');
    expect(out[1].text).toBe('Reduced p99 latency by 47%');
    expect(out[2].text).toBe('Migrated services');
  });

  it('handles empty block as empty array', () => {
    expect(analyzeAchievementsBlock('')).toEqual([]);
    expect(analyzeAchievementsBlock('\n   \n')).toEqual([]);
  });
});

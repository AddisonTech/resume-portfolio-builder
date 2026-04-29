import { describe, expect, it } from 'vitest';
import { sampleResume } from '../store/sample';
import { defaultResume } from '../store/defaults';

describe('sampleResume', () => {
  it('matches expected top-level shape', () => {
    const s = sampleResume();
    expect(Object.keys(s).sort()).toEqual(
      ['certifications', 'education', 'experience', 'personal', 'projects', 'skills'].sort(),
    );
    expect(s.personal.name).toBe('Jane Doe');
    expect(s.experience.length).toBe(2);
    expect(s.skills.categories.length).toBe(4);
    expect(s.projects.length).toBe(1);
    expect(s.certifications.length).toBe(2);
  });

  it('every experience entry has an achievements string', () => {
    for (const exp of sampleResume().experience) {
      expect(typeof exp.achievements).toBe('string');
      expect(exp.achievements.length).toBeGreaterThan(0);
    }
  });
});

describe('defaultResume', () => {
  it('produces empty arrays and an empty personal block', () => {
    const d = defaultResume();
    expect(d.education).toEqual([]);
    expect(d.experience).toEqual([]);
    expect(d.projects).toEqual([]);
    expect(d.certifications).toEqual([]);
    expect(d.skills.categories).toEqual([]);
    expect(d.personal.name).toBe('');
    expect(d.personal.email).toBe('');
  });
});

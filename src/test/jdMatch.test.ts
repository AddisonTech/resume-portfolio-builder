import { describe, expect, it } from 'vitest';
import { sampleResume } from '../store/sample';
import {
  bigrams,
  buildResumeCorpus,
  extractJdKeywords,
  matchResume,
  termPresent,
  tokenize,
} from '../analysis/jdMatch';

describe('tokenize', () => {
  it('preserves tech symbols and drops stopwords', () => {
    const toks = tokenize('We are looking for engineers with C++ and C# experience.');
    expect(toks).toContain('c++');
    expect(toks).toContain('c#');
    expect(toks).not.toContain('we');
    expect(toks).not.toContain('experience');
  });

  it('drops single-letter tokens but keeps c++ and c#', () => {
    const toks = tokenize('Need a engineer who knows c++ and c# well.');
    // 'a' is a stopword, single chars that are not c++/c# get filtered by min-len
    expect(toks).toContain('c++');
    expect(toks).toContain('c#');
    expect(toks).not.toContain('a');
  });

  it('strips trailing punctuation but keeps internal symbols', () => {
    const toks = tokenize('Knowledge of node.js, vue.js. Python.');
    expect(toks).toContain('node.js');
    expect(toks).toContain('vue.js');
    expect(toks).toContain('python');
  });
});

describe('bigrams', () => {
  it('joins adjacent tokens', () => {
    expect(bigrams(['machine', 'learning', 'pipeline'])).toEqual([
      'machine learning',
      'learning pipeline',
    ]);
  });
  it('returns empty for short token streams', () => {
    expect(bigrams([])).toEqual([]);
    expect(bigrams(['solo'])).toEqual([]);
  });
});

describe('termPresent', () => {
  it('matches whole words inside corpus', () => {
    expect(termPresent('python', 'we ship python services')).toBe(true);
    expect(termPresent('python', 'pythonic patterns')).toBe(false);
  });

  it('handles tech symbols verbatim (parity with python regex)', () => {
    const corpus = 'experience writing c++ and c# code';
    expect(termPresent('c++', corpus)).toBe(true);
    expect(termPresent('c#', corpus)).toBe(true);
  });

  it('matches multi-word phrases', () => {
    expect(termPresent('machine learning', 'used machine learning models')).toBe(true);
    expect(termPresent('machine learning', 'applied machinelearning models')).toBe(false);
  });
});

describe('extractJdKeywords', () => {
  it('returns [] for empty input', () => {
    expect(extractJdKeywords('')).toEqual([]);
    expect(extractJdKeywords('   ')).toEqual([]);
  });

  it('ranks repeated terms higher', () => {
    const jd = `
      We are hiring a Senior Backend Engineer to lead Kubernetes platform work.
      Kubernetes is at the heart of our stack. Kubernetes operators required.
      Strong distributed systems background. Distributed systems ownership.
    `;
    const kws = extractJdKeywords(jd);
    expect(kws.length).toBeGreaterThan(0);
    // The top weighted term should be either kubernetes (3x) or a strong phrase
    const top = kws[0];
    expect(['kubernetes', 'distributed systems'].includes(top.term)).toBe(true);
  });
});

describe('buildResumeCorpus + matchResume', () => {
  it('finds keywords from sample resume', () => {
    const corpus = buildResumeCorpus(sampleResume()).toLowerCase();
    expect(corpus).toContain('python');
    expect(corpus).toContain('typescript');
    expect(corpus).toContain('kubernetes');
  });

  it('returns 0 score for an empty job description', () => {
    const r = matchResume(sampleResume(), '');
    expect(r.score).toBe(0);
    expect(r.totalKw).toBe(0);
  });

  it('scores a related JD against the sample resume reasonably high', () => {
    const jd = `
      We are looking for a Senior Software Engineer with Python, TypeScript,
      Kubernetes, and Postgres experience. You'll lead distributed systems
      work, build APIs with FastAPI, and mentor engineers. Docker and Redis
      familiarity required. Distributed systems and microservices a plus.
    `;
    const r = matchResume(sampleResume(), jd);
    expect(r.score).toBeGreaterThanOrEqual(40);
    expect(r.matchedKw).toBeGreaterThan(0);
    expect(r.totalKw).toBeGreaterThan(r.matchedKw - 1);
    expect(r.jdExcerpt.length).toBeGreaterThan(0);
  });

  it('scores an unrelated JD low and surfaces gaps', () => {
    const jd = `
      We are hiring a marine biology field researcher. Diving certification
      required. Coral reef survey and underwater photography experience
      preferred. Boat handling. Wetsuit comfort essential.
    `;
    const r = matchResume(sampleResume(), jd, 5);
    expect(r.score).toBeLessThan(30);
    expect(r.missing.length).toBeGreaterThan(0);
    expect(r.missing.length).toBeLessThanOrEqual(5);
  });
});

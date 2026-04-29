import { useMemo, useState } from 'react';
import { matchResume } from '../../analysis/jdMatch';
import { useResumeStore } from '../../store/useResumeStore';
import { KeywordChipRow } from '../shared/KeywordChip';
import { TextArea } from '../shared/TextArea';

export function JdMatchTab() {
  const data = useResumeStore((s) => s.data);
  const jdText = useResumeStore((s) => s.jdText);
  const setJdText = useResumeStore((s) => s.setJdText);
  const [open, setOpen] = useState(false);

  const trimmed = jdText.trim();
  const result = useMemo(() => (trimmed ? matchResume(data, jdText, 12) : null), [
    data,
    jdText,
    trimmed,
  ]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 980 }}>
      <header>
        <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
          Job description match
        </h2>
        <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
          Paste a job description. The matcher pulls signal-rich keywords and checks
          which ones appear in your bullets, summary, skills, and projects.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        <TextArea
          label="Paste job description"
          value={jdText}
          rows={14}
          placeholder={
            "We're looking for a Senior Software Engineer to lead our platform team. " +
            "You'll architect distributed systems on Kubernetes, mentor engineers, and " +
            'drive observability improvements across the stack...'
          }
          onChange={(e) => setJdText(e.target.value)}
        />
        <ScoreCard result={result} />
      </div>

      {result && (
        <>
          <div>
            <h3
              style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--good)',
                margin: '0 0 6px',
              }}
            >
              ✓ Matched in your resume{' '}
              <span style={{ color: 'var(--text-1)', fontWeight: 400, fontSize: '0.82rem' }}>
                ({result.matched.length})
              </span>
            </h3>
            <KeywordChipRow items={result.matched.slice(0, 30)} tone="ok" />
          </div>

          <div>
            <h3
              style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--warn)',
                margin: '0 0 6px',
              }}
            >
              ○ Top gaps to address{' '}
              <span style={{ color: 'var(--text-1)', fontWeight: 400, fontSize: '0.82rem' }}>
                ({result.missing.length})
              </span>
            </h3>
            <KeywordChipRow items={result.missing} tone="miss" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                appearance: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-1)',
                cursor: 'pointer',
                fontFamily: 'var(--ff-mono)',
                fontSize: 12,
                padding: 0,
              }}
            >
              {open ? '▾' : '▸'} How is this calculated?
            </button>
            {open && (
              <ul
                style={{
                  margin: '8px 0 0',
                  paddingLeft: 18,
                  color: 'var(--text-1)',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <li>
                  Tokenize the JD, drop stopwords + filler ("team", "experience",
                  "role"…), then rank single words and 2-word phrases by frequency.
                </li>
                <li>Phrases get a 1.6× weight bonus — they carry more signal than single words.</li>
                <li>
                  Your resume corpus is everything an ATS would scan: bullets, summary, skills,
                  project highlights, position titles, certifications.
                </li>
                <li>
                  The score is the percentage of weighted keywords present in the corpus.
                  70+ is strong, 45–69 is partial, below 45 means the resume needs work for this posting.
                </li>
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

interface ScoreCardProps {
  result: ReturnType<typeof matchResume> | null;
}

function ScoreCard({ result }: ScoreCardProps) {
  if (!result) {
    return (
      <div
        style={{
          padding: '24px 20px',
          borderRadius: 12,
          border: '1px dashed rgba(148,163,184,.25)',
          background: 'rgba(255,255,255,.02)',
          textAlign: 'center',
          alignSelf: 'start',
        }}
      >
        <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{'>_'}</div>
        <div style={{ color: 'var(--text-1)', fontSize: '0.86rem', lineHeight: 1.55 }}>
          Paste a job description to see your match score and the keywords your resume is missing.
        </div>
      </div>
    );
  }

  const { score } = result;
  const color =
    score >= 70 ? 'var(--good)' : score >= 45 ? 'var(--warn)' : 'var(--bad)';
  const label =
    score >= 70 ? 'Strong match' : score >= 45 ? 'Partial match' : 'Light match';

  return (
    <div
      style={{
        padding: '18px 20px',
        borderRadius: 12,
        border: '1px solid rgba(148,163,184,.20)',
        background:
          'linear-gradient(135deg, rgba(34,211,238,.04) 0%, rgba(167,139,250,.04) 100%)',
        alignSelf: 'start',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 11,
          color: 'var(--text-1)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        // JD Match Score
      </div>
      <div
        style={{
          fontFamily: 'var(--ff-display)',
          fontSize: '2.6rem',
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {score}
        <span
          style={{
            fontSize: '1rem',
            color: 'var(--text-1)',
            fontWeight: 500,
            marginLeft: 2,
          }}
        >
          /100
        </span>
      </div>
      <div style={{ fontSize: '0.85rem', color, marginTop: 4, fontWeight: 500 }}>{label}</div>
      <div
        style={{
          fontSize: '0.78rem',
          color: 'var(--text-1)',
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        Matched <strong style={{ color: 'var(--text-0)' }}>{result.matchedKw}</strong> of{' '}
        <strong style={{ color: 'var(--text-0)' }}>{result.totalKw}</strong> keywords
      </div>
    </div>
  );
}

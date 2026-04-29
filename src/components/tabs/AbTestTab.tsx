import { type BulletAnalysis, analyzeBullet } from '../../analysis/bulletStrength';
import { useResumeStore } from '../../store/useResumeStore';
import { ScoreRing, StrengthChip } from '../shared/StrengthChip';
import { TextArea } from '../shared/TextArea';

interface PanelProps {
  label: 'A' | 'B';
  value: string;
  onChange: (v: string) => void;
  color: string;
  placeholder: string;
}

function Panel({ label, value, onChange, color, placeholder }: PanelProps) {
  const a = value.trim() ? analyzeBullet(value) : null;
  const ringColor =
    a?.score === 3 ? 'var(--good)' : a?.score === 2 ? 'var(--warn)' : 'var(--bad)';
  const ringLabel = a?.score === 3 ? 'STRONG' : a?.score === 2 ? 'MEDIUM' : 'WEAK';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: '0.78rem',
          color,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        // Version {label}
      </div>
      <TextArea
        label={`Bullet ${label}`}
        value={value}
        rows={4}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {a && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 10,
            }}
          >
            <ScoreRing score={a.score} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: '0.7rem',
                  color: ringColor,
                  letterSpacing: '0.10em',
                  fontWeight: 600,
                }}
              >
                {ringLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-1)', marginTop: 2 }}>
                {a.length} chars
              </div>
            </div>
          </div>
          <div>
            <StrengthChip analysis={a} />
          </div>
        </>
      )}
    </div>
  );
}

export function AbTestTab() {
  const abA = useResumeStore((s) => s.abA);
  const abB = useResumeStore((s) => s.abB);
  const setAbA = useResumeStore((s) => s.setAbA);
  const setAbB = useResumeStore((s) => s.setAbB);

  const aAnalysis = abA.trim() ? analyzeBullet(abA) : null;
  const bAnalysis = abB.trim() ? analyzeBullet(abB) : null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 980 }}>
      <header>
        <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
          A/B bullet test
        </h2>
        <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
          Paste two versions of the same bullet. Each is scored on strong verb,
          quantified outcome, and length sweet spot.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Panel
          label="A"
          value={abA}
          onChange={setAbA}
          color="var(--cyan)"
          placeholder="Worked on the team to ship features."
        />
        <Panel
          label="B"
          value={abB}
          onChange={setAbB}
          color="var(--violet)"
          placeholder={
            'Led 4-engineer team to ship 9 features in 12 months, lifting retention from 41% to 58%.'
          }
        />
      </div>

      {aAnalysis && bAnalysis && <Verdict a={aAnalysis} b={bAnalysis} />}
    </section>
  );
}

function Verdict({ a, b }: { a: BulletAnalysis; b: BulletAnalysis }) {
  let winner: 'A' | 'B' | 'tie';
  let color: string;
  let verdict: string;
  if (a.score > b.score) {
    winner = 'A';
    color = 'var(--cyan)';
    verdict = `Version A scores higher (${a.score} vs ${b.score}).`;
  } else if (b.score > a.score) {
    winner = 'B';
    color = 'var(--violet)';
    verdict = `Version B scores higher (${b.score} vs ${a.score}).`;
  } else {
    winner = 'tie';
    color = 'var(--text-1)';
    verdict = `Tie at ${a.score}/3. Tighten one of them on the dimension that's still missing.`;
  }
  void winner;

  const Row = ({ label, aOk, bOk }: { label: string; aOk: boolean; bOk: boolean }) => (
    <tr>
      <td
        style={{
          padding: '8px 12px',
          color: 'var(--text-1)',
          fontSize: '0.82rem',
          borderBottom: '1px solid rgba(148,163,184,.12)',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '8px 12px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(148,163,184,.12)',
          fontFamily: 'var(--ff-mono)',
          fontSize: '0.78rem',
          color: aOk ? 'var(--good)' : 'var(--bad)',
          fontWeight: 700,
        }}
      >
        {aOk ? 'YES' : 'NO'}
      </td>
      <td
        style={{
          padding: '8px 12px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(148,163,184,.12)',
          fontFamily: 'var(--ff-mono)',
          fontSize: '0.78rem',
          color: bOk ? 'var(--good)' : 'var(--bad)',
          fontWeight: 700,
        }}
      >
        {bOk ? 'YES' : 'NO'}
      </td>
    </tr>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 12,
          background:
            'linear-gradient(135deg, rgba(34,211,238,.06), rgba(167,139,250,.06))',
          border: `1px solid ${color}40`,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: '0.72rem',
            color,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Verdict
        </div>
        <div style={{ color: 'var(--text-0)', fontSize: '0.95rem', lineHeight: 1.55 }}>
          {verdict}
        </div>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'rgba(255,255,255,.025)',
          border: '1px solid rgba(148,163,184,.15)',
          borderRadius: 10,
          overflow: 'hidden',
          fontFamily: 'var(--ff-sans)',
        }}
      >
        <thead>
          <tr style={{ background: 'rgba(255,255,255,.03)' }}>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                color: 'var(--text-1)',
                fontSize: '0.74rem',
                fontFamily: 'var(--ff-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                fontWeight: 500,
              }}
            >
              Dimension
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                color: 'var(--cyan)',
                fontSize: '0.74rem',
                fontFamily: 'var(--ff-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                fontWeight: 600,
              }}
            >
              Version A
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                color: 'var(--violet)',
                fontSize: '0.74rem',
                fontFamily: 'var(--ff-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                fontWeight: 600,
              }}
            >
              Version B
            </th>
          </tr>
        </thead>
        <tbody>
          <Row label="Strong opening verb" aOk={a.hasVerb} bOk={b.hasVerb} />
          <Row label="Quantified outcome" aOk={a.hasNumber} bOk={b.hasNumber} />
          <Row label="Length sweet spot (30 to 200)" aOk={a.lengthOk} bOk={b.lengthOk} />
        </tbody>
      </table>
    </div>
  );
}

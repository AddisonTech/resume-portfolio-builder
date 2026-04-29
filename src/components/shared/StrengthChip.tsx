import type { BulletAnalysis } from '../../analysis/bulletStrength';
import styles from './StrengthChip.module.css';

function glyph(ok: boolean, warn = false): { mark: string; color: string } {
  if (ok) return { mark: '✓', color: 'var(--good)' };
  if (warn) return { mark: '⚠', color: 'var(--warn)' };
  return { mark: '✗', color: 'var(--bad)' };
}

export function StrengthChip({ analysis }: { analysis: BulletAnalysis }) {
  const n = glyph(analysis.hasNumber);
  const v = glyph(analysis.hasVerb);
  const len = analysis.length;
  let l: { mark: string; color: string };
  if (len >= 30 && len <= 200) l = glyph(true);
  else if (len >= 20 && len <= 240) l = glyph(false, true);
  else l = glyph(false);

  return (
    <span className={styles.chip} role="status">
      <span style={{ color: n.color }}>{n.mark}</span>
      <span className={styles.dim}>number</span>
      <span className={styles.sep}>|</span>
      <span style={{ color: v.color }}>{v.mark}</span>
      <span className={styles.dim}>verb</span>
      <span className={styles.sep}>|</span>
      <span style={{ color: l.color }}>{l.mark}</span>
      <span className={styles.dim}>{len} chars</span>
    </span>
  );
}

export function StrengthChipRow({ analyses }: { analyses: BulletAnalysis[] }) {
  if (!analyses.length) return null;
  return (
    <div className={styles.row}>
      {analyses.map((a, i) => (
        <StrengthChip key={i} analysis={a} />
      ))}
    </div>
  );
}

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 46 }: ScoreRingProps) {
  const color =
    score === 3 ? 'var(--good)' : score === 2 ? 'var(--warn)' : 'var(--bad)';
  return (
    <div
      className={styles.score}
      style={{
        width: size,
        height: size,
        borderColor: color,
        color: color,
        fontSize: size > 40 ? '1.05rem' : '0.85rem',
      }}
    >
      {score}
    </div>
  );
}

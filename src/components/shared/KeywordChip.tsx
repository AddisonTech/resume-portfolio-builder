import type { Keyword } from '../../analysis/jdMatch';
import styles from './KeywordChip.module.css';

interface ChipProps {
  term: string;
  kind: Keyword['kind'];
  tone: 'ok' | 'miss';
}

export function KeywordChip({ term, kind, tone }: ChipProps) {
  const glyph = tone === 'ok' ? '✓' : '○';
  const label = kind === 'phrase' ? 'phrase' : 'word';
  const cls = tone === 'ok' ? styles.ok : styles.miss;
  return (
    <span className={`${styles.chip} ${cls}`}>
      <span aria-hidden>{glyph}</span>
      <span>{term}</span>
      <span className={styles.label}>[{label}]</span>
    </span>
  );
}

interface RowProps {
  items: Keyword[];
  tone: 'ok' | 'miss';
}

export function KeywordChipRow({ items, tone }: RowProps) {
  if (!items.length) {
    return (
      <span style={{ color: 'var(--text-1)', fontStyle: 'italic', fontSize: 13 }}>
        none
      </span>
    );
  }
  return (
    <div className={styles.row}>
      {items.map((kw) => (
        <KeywordChip key={`${kw.kind}:${kw.term}`} term={kw.term} kind={kw.kind} tone={tone} />
      ))}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './EntryCard.module.css';

interface Props {
  title: string;
  onRemove?: () => void;
  children: ReactNode;
}

export function EntryCard({ title, onRemove, children }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
          >
            Remove
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

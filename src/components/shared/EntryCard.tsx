import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './EntryCard.module.css';

interface Props {
  title: string;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: ReactNode;
}

export function EntryCard({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: Props) {
  const showReorder = onMoveUp || onMoveDown;
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.actions}>
          {showReorder && (
            <div className={styles.reorder} role="group" aria-label="Reorder entry">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                aria-label={`Move ${title} up`}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                aria-label={`Move ${title} down`}
              >
                ↓
              </Button>
            </div>
          )}
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
      </div>
      {children}
    </div>
  );
}

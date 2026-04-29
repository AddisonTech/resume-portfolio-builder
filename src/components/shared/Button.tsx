import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'default' | 'primary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  full = false,
  className,
  children,
  ...rest
}: Props) {
  const classes = [
    styles.btn,
    variant === 'primary' ? styles.primary : '',
    variant === 'danger' ? styles.danger : '',
    variant === 'ghost' ? styles.ghost : '',
    size === 'sm' ? styles.sm : '',
    full ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

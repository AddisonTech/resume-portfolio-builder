import type { TextareaHTMLAttributes, ReactNode } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: ReactNode;
}

let nextId = 0;

export function TextArea({ label, hint, id, ...rest }: Props) {
  const fieldId = id ?? `ta-${(nextId += 1)}`;
  return (
    <label
      htmlFor={fieldId}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-1)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'var(--ff-mono)',
        }}
      >
        {label}
      </span>
      <textarea
        id={fieldId}
        {...rest}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-0)',
          padding: '10px 12px',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--ff-sans)',
          fontSize: '13px',
          resize: 'vertical',
          minHeight: '80px',
          outline: 'none',
          transition: 'border-color var(--t)',
          minWidth: 0,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          rest.onBlur?.(e);
        }}
      />
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--text-1)' }}>{hint}</span>
      )}
    </label>
  );
}

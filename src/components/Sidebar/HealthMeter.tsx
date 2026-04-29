import { useState } from 'react';
import { scoreResumeHealth } from '../../analysis/resumeHealth';
import { useResumeStore } from '../../store/useResumeStore';

export function HealthMeter() {
  const data = useResumeStore((s) => s.data);
  const [open, setOpen] = useState(false);
  const report = scoreResumeHealth(data);
  const score = report.score;
  const color =
    score >= 80 ? 'var(--good)' : score >= 50 ? 'var(--warn)' : 'var(--bad)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: '11px',
            color: 'var(--text-1)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Resume Health
        </span>
        <span
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: '18px',
            fontWeight: 700,
            color,
          }}
        >
          {score}
          <span style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 400 }}>
            /100
          </span>
        </span>
      </div>

      <div
        style={{
          height: '6px',
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, score))}%`,
            background: color,
            transition: 'width var(--t)',
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-1)',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'var(--ff-mono)',
          textAlign: 'left',
          padding: 0,
          letterSpacing: '0.04em',
        }}
        aria-expanded={open}
      >
        {open ? '▾ hide breakdown' : '▸ show breakdown'}
      </button>

      {open && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {report.breakdown.map((b) => (
            <li key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-0)' }}>{b.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--ff-mono)',
                    color: 'var(--text-1)',
                  }}
                >
                  {b.pts}/{b.max}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-1)' }}>{b.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

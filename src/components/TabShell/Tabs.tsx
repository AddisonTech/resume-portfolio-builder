import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import styles from './Tabs.module.css';

export interface TabDef {
  id: string;
  label: string;
  glyph?: string;
  render: () => ReactNode;
}

interface Props {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!tabs.find((t) => t.id === active) && tabs[0]) onChange(tabs[0].id);
  }, [tabs, active, onChange]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === active);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    const target = tabs[next];
    onChange(target.id);
    refs.current[target.id]?.focus();
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Resume sections"
        className={styles.tabBar}
        onKeyDown={onKeyDown}
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onChange(t.id)}
            >
              {t.glyph && <span className={styles.glyph}>{t.glyph}</span>}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className={styles.panel}
      >
        {activeTab?.render()}
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { downloadJson, loadJsonFile } from '../../store/persistence';
import type { TemplateName } from '../../types';
import { Button } from '../shared/Button';
import { HealthMeter } from './HealthMeter';
import styles from './Sidebar.module.css';

const TEMPLATES: TemplateName[] = ['Modern', 'Classic', 'Minimal'];

export function Sidebar() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);
  const accent = useResumeStore((s) => s.accent);
  const darkMode = useResumeStore((s) => s.darkMode);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setAccent = useResumeStore((s) => s.setAccent);
  const toggleDarkMode = useResumeStore((s) => s.toggleDarkMode);
  const loadSample = useResumeStore((s) => s.loadSample);
  const clearAll = useResumeStore((s) => s.clearAll);
  const setData = useResumeStore((s) => s.setData);

  const onLoadFile = async (file: File) => {
    setLoadError(null);
    try {
      const parsed = await loadJsonFile(file);
      setData(parsed);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load file');
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="Resume builder controls">
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>Resume Builder</h1>
        <span className={styles.brandTag}>// React port</span>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Dark mode</span>
          <button
            type="button"
            className={`${styles.switch} ${darkMode ? styles.switchOn : ''}`}
            onClick={toggleDarkMode}
            aria-pressed={darkMode}
            aria-label="Toggle dark mode"
          >
            <span className={styles.switchKnob} aria-hidden />
          </button>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Template</h2>
        <div className={styles.tplGrid} role="group" aria-label="Template style">
          {TEMPLATES.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.tplBtn} ${template === t ? styles.tplBtnActive : ''}`}
              onClick={() => setTemplate(t)}
              aria-pressed={template === t}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className={styles.sectionTitle} style={{ marginTop: '6px' }}>
          Accent
        </h2>
        <div className={styles.colorPick}>
          <input
            type="color"
            className={styles.colorBox}
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            aria-label="Accent color"
          />
          <span className={styles.colorHex}>{accent.toUpperCase()}</span>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data</h2>
        <div className={styles.row}>
          <Button onClick={loadSample} full>
            Sample
          </Button>
          <Button onClick={clearAll} variant="ghost" full>
            Clear
          </Button>
        </div>
        <Button onClick={() => downloadJson(data)} full>
          Save JSON
        </Button>
        <button
          type="button"
          className={styles.fileBtn}
          onClick={() => fileInput.current?.click()}
        >
          Load JSON
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onLoadFile(f);
            e.target.value = '';
          }}
        />
        {loadError && <span className={styles.error}>{loadError}</span>}
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <HealthMeter />
      </div>

      <div className={styles.foot}>vite · react · ts</div>
    </aside>
  );
}

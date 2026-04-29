import { useMemo } from 'react';
import { generateHtml } from '../../export/htmlTemplate';
import { downloadText } from '../../export/download';
import { downloadJson } from '../../store/persistence';
import { useResumeStore } from '../../store/useResumeStore';
import { ResumeFrame } from '../preview/ResumeFrame';
import { Button } from '../shared/Button';

export function PreviewTab() {
  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);
  const accent = useResumeStore((s) => s.accent);

  const html = useMemo(() => generateHtml(data, template, accent), [data, template, accent]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Preview &amp; export
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            Live render of your resume in the selected template. Download as HTML, JSON, or PDF.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            onClick={() => downloadText(html, 'resume.html', 'text/html')}
            variant="primary"
          >
            Download HTML
          </Button>
          <Button onClick={() => downloadJson(data, 'resume.json')}>Download JSON</Button>
          <Button
            disabled
            title="PDF export lands in the next commit — wires up on click."
          >
            Download PDF
          </Button>
        </div>
      </header>

      <ResumeFrame html={html} />
    </section>
  );
}

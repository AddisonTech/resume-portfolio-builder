import { useMemo, useState } from 'react';
import { generateHtml } from '../../export/htmlTemplate';
import { downloadBlob, downloadText } from '../../export/download';
import { downloadJson } from '../../store/persistence';
import { useResumeStore } from '../../store/useResumeStore';
import { ResumeFrame } from '../preview/ResumeFrame';
import { Button } from '../shared/Button';

export function PreviewTab() {
  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);
  const accent = useResumeStore((s) => s.accent);

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const html = useMemo(() => generateHtml(data, template, accent), [data, template, accent]);

  const onDownloadPdf = async () => {
    setPdfBusy(true);
    setPdfError(null);
    try {
      // Lazy-import to keep the PDF renderer out of the initial bundle.
      const [{ pdf }, { ResumePdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../export/pdfDocument'),
      ]);
      const blob = await pdf(<ResumePdfDocument data={data} accent={accent} />).toBlob();
      downloadBlob(blob, 'resume.pdf');
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setPdfBusy(false);
    }
  };

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            onClick={() => downloadText(html, 'resume.html', 'text/html')}
            variant="primary"
          >
            Download HTML
          </Button>
          <Button onClick={() => downloadJson(data, 'resume.json')}>Download JSON</Button>
          <Button
            onClick={() => void onDownloadPdf()}
            disabled={pdfBusy}
            title="PDF render is lazy-loaded; first click takes ~1s while the renderer initializes."
          >
            {pdfBusy ? 'Generating PDF…' : 'Download PDF'}
          </Button>
          {pdfError && (
            <span
              style={{
                color: 'var(--bad)',
                fontFamily: 'var(--ff-mono)',
                fontSize: 11,
              }}
            >
              {pdfError}
            </span>
          )}
        </div>
      </header>

      <ResumeFrame html={html} />
    </section>
  );
}

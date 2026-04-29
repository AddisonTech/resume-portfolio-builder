import { useResumeStore } from '../../store/useResumeStore';
import { Button } from '../shared/Button';
import { Field } from '../shared/Field';

export function CertsTab() {
  const list = useResumeStore((s) => s.data.certifications);
  const add = useResumeStore((s) => s.addCertification);
  const update = useResumeStore((s) => s.updateCertification);
  const remove = useResumeStore((s) => s.removeCertification);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Certifications &amp; awards
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            Add credentials, awards, and recognitions.
          </p>
        </div>
        <Button variant="primary" onClick={add}>
          + Add certification
        </Button>
      </header>

      {list.length === 0 && (
        <div
          style={{
            padding: 24,
            border: '1px dashed var(--border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text-1)',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          No certifications yet. Click "Add certification" to get started.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((cert, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 90px 1.4fr auto',
              gap: 10,
              alignItems: 'end',
            }}
          >
            <Field
              label="Name"
              value={cert.name}
              placeholder="AWS Certified Solutions Architect"
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <Field
              label="Issuer"
              value={cert.issuer}
              placeholder="Amazon Web Services"
              onChange={(e) => update(i, { issuer: e.target.value })}
            />
            <Field
              label="Date"
              value={cert.date}
              placeholder="2023"
              onChange={(e) => update(i, { date: e.target.value })}
            />
            <Field
              label="Credential URL"
              value={cert.url}
              placeholder="credly.com/..."
              onChange={(e) => update(i, { url: e.target.value })}
            />
            <Button variant="ghost" onClick={() => remove(i)} aria-label="Remove certification">
              Remove
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

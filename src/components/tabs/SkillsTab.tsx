import { useResumeStore } from '../../store/useResumeStore';
import { Button } from '../shared/Button';
import { Field } from '../shared/Field';

export function SkillsTab() {
  const list = useResumeStore((s) => s.data.skills.categories);
  const add = useResumeStore((s) => s.addSkillCategory);
  const update = useResumeStore((s) => s.updateSkillCategory);
  const remove = useResumeStore((s) => s.removeSkillCategory);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Skills
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            Group skills into categories like Languages, Frameworks, Tools, Practices.
          </p>
        </div>
        <Button variant="primary" onClick={add}>
          + Add category
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
          No skill categories yet. Click "Add category" to get started.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((cat, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 200px) 1fr auto',
              gap: 10,
              alignItems: 'end',
            }}
          >
            <Field
              label="Category"
              value={cat.name}
              placeholder="Languages"
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <Field
              label="Items"
              value={cat.items}
              placeholder="Python, TypeScript, Go, SQL"
              onChange={(e) => update(i, { items: e.target.value })}
              hint="Comma-separated."
            />
            <Button variant="ghost" onClick={() => remove(i)} aria-label="Remove category">
              Remove
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

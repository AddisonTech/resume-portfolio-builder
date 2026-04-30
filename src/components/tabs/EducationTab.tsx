import { useResumeStore } from '../../store/useResumeStore';
import { Button } from '../shared/Button';
import { EntryCard } from '../shared/EntryCard';
import { Field } from '../shared/Field';

export function EducationTab() {
  const list = useResumeStore((s) => s.data.education);
  const add = useResumeStore((s) => s.addEducation);
  const update = useResumeStore((s) => s.updateEducation);
  const remove = useResumeStore((s) => s.removeEducation);
  const reorder = useResumeStore((s) => s.reorderEducation);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Education
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            Add degrees, programs, and notable coursework.
          </p>
        </div>
        <Button variant="primary" onClick={add}>
          + Add entry
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
          No education entries yet. Click "Add entry" to get started.
        </div>
      )}

      {list.map((edu, i) => {
        const title = `${edu.degree || 'New entry'} — ${edu.institution || '...'}`;
        return (
          <EntryCard
            key={i}
            title={title}
            onRemove={() => remove(i)}
            onMoveUp={() => reorder(i, i - 1)}
            onMoveDown={() => reorder(i, i + 1)}
            canMoveUp={i > 0}
            canMoveDown={i < list.length - 1}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Degree"
                value={edu.degree}
                placeholder="Bachelor of Science"
                onChange={(e) => update(i, { degree: e.target.value })}
              />
              <Field
                label="Field of study"
                value={edu.field}
                placeholder="Computer Science"
                onChange={(e) => update(i, { field: e.target.value })}
              />
              <Field
                label="Institution"
                value={edu.institution}
                placeholder="University of California, Berkeley"
                onChange={(e) => update(i, { institution: e.target.value })}
              />
              <Field
                label="Location"
                value={edu.location}
                placeholder="Berkeley, CA"
                onChange={(e) => update(i, { location: e.target.value })}
              />
              <Field
                label="Start year"
                value={edu.start_year}
                placeholder="2014"
                onChange={(e) => update(i, { start_year: e.target.value })}
              />
              <Field
                label="End year"
                value={edu.end_year}
                placeholder="2018 or Present"
                onChange={(e) => update(i, { end_year: e.target.value })}
              />
              <Field
                label="GPA (optional)"
                value={edu.gpa}
                placeholder="3.9"
                onChange={(e) => update(i, { gpa: e.target.value })}
              />
              <Field
                label="Honors / awards"
                value={edu.honors}
                placeholder="Magna Cum Laude"
                onChange={(e) => update(i, { honors: e.target.value })}
              />
            </div>
            <Field
              label="Relevant courses"
              value={edu.relevant_courses}
              placeholder="Algorithms, Distributed Systems, Machine Learning"
              onChange={(e) => update(i, { relevant_courses: e.target.value })}
              hint="Comma-separated."
            />
          </EntryCard>
        );
      })}
    </section>
  );
}

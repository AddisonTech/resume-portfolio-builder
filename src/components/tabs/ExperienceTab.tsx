import { analyzeAchievementsBlock } from '../../analysis/bulletStrength';
import { useResumeStore } from '../../store/useResumeStore';
import { Button } from '../shared/Button';
import { EntryCard } from '../shared/EntryCard';
import { Field } from '../shared/Field';
import { StrengthChipRow } from '../shared/StrengthChip';
import { TextArea } from '../shared/TextArea';

export function ExperienceTab() {
  const list = useResumeStore((s) => s.data.experience);
  const add = useResumeStore((s) => s.addExperience);
  const update = useResumeStore((s) => s.updateExperience);
  const remove = useResumeStore((s) => s.removeExperience);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Work experience
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            One bullet per line under achievements. The analyzer scores each line live.
          </p>
        </div>
        <Button variant="primary" onClick={add}>
          + Add experience
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
          No experience entries yet. Click "Add experience" to get started.
        </div>
      )}

      {list.map((exp, i) => {
        const title = `${exp.position || 'New position'} @ ${exp.company || '...'}`;
        const analyses = analyzeAchievementsBlock(exp.achievements);
        return (
          <EntryCard key={i} title={title} onRemove={() => remove(i)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Job title"
                value={exp.position}
                placeholder="Software Engineer"
                onChange={(e) => update(i, { position: e.target.value })}
              />
              <Field
                label="Company"
                value={exp.company}
                placeholder="Acme Corp"
                onChange={(e) => update(i, { company: e.target.value })}
              />
              <Field
                label="Location"
                value={exp.location}
                placeholder="San Francisco, CA"
                onChange={(e) => update(i, { location: e.target.value })}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--text-0)',
                  alignSelf: 'end',
                  paddingBottom: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    update(i, {
                      current: e.target.checked,
                      end_date: e.target.checked ? 'Present' : exp.end_date === 'Present' ? '' : exp.end_date,
                    })
                  }
                />
                I currently work here
              </label>
              <Field
                label="Start date"
                value={exp.start_date}
                placeholder="Jan 2022"
                onChange={(e) => update(i, { start_date: e.target.value })}
              />
              <Field
                label="End date"
                value={exp.end_date}
                placeholder="Present"
                disabled={exp.current}
                onChange={(e) => update(i, { end_date: e.target.value })}
              />
            </div>
            <TextArea
              label="Role description"
              value={exp.description}
              rows={3}
              placeholder="Brief overview of your role and responsibilities."
              onChange={(e) => update(i, { description: e.target.value })}
            />
            <TextArea
              label="Key achievements (one per line)"
              value={exp.achievements}
              rows={5}
              placeholder={'Reduced API latency by 40%\nLed migration to microservices'}
              onChange={(e) => update(i, { achievements: e.target.value })}
              hint="Strong bullets start with an action verb, include a number, and stay between 30-200 characters."
            />
            <StrengthChipRow analyses={analyses} />
          </EntryCard>
        );
      })}
    </section>
  );
}

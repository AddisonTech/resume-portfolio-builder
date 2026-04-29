import { analyzeAchievementsBlock } from '../../analysis/bulletStrength';
import { useResumeStore } from '../../store/useResumeStore';
import { Button } from '../shared/Button';
import { EntryCard } from '../shared/EntryCard';
import { Field } from '../shared/Field';
import { StrengthChipRow } from '../shared/StrengthChip';
import { TextArea } from '../shared/TextArea';

export function ProjectsTab() {
  const list = useResumeStore((s) => s.data.projects);
  const add = useResumeStore((s) => s.addProject);
  const update = useResumeStore((s) => s.updateProject);
  const remove = useResumeStore((s) => s.removeProject);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 880 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
            Projects
          </h2>
          <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
            Highlight side work, open source, and notable builds. Highlights are scored live.
          </p>
        </div>
        <Button variant="primary" onClick={add}>
          + Add project
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
          No projects yet. Click "Add project" to get started.
        </div>
      )}

      {list.map((proj, i) => {
        const title = proj.name || `Project ${i + 1}`;
        const analyses = analyzeAchievementsBlock(proj.highlights);
        return (
          <EntryCard key={i} title={title} onRemove={() => remove(i)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field
                label="Project name"
                value={proj.name}
                placeholder="Awesome API"
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <Field
                label="Tech / stack"
                value={proj.tech}
                placeholder="Python, FastAPI, PostgreSQL"
                onChange={(e) => update(i, { tech: e.target.value })}
              />
              <Field
                label="GitHub URL"
                value={proj.github_url}
                placeholder="github.com/you/project"
                onChange={(e) => update(i, { github_url: e.target.value })}
              />
              <Field
                label="Live demo URL"
                value={proj.live_url}
                placeholder="project.vercel.app"
                onChange={(e) => update(i, { live_url: e.target.value })}
              />
            </div>
            <TextArea
              label="Description"
              value={proj.description}
              rows={3}
              placeholder="What does this project do, and why did you build it?"
              onChange={(e) => update(i, { description: e.target.value })}
            />
            <TextArea
              label="Key highlights (one per line)"
              value={proj.highlights}
              rows={4}
              placeholder={'10k+ GitHub stars\nFeatured on Hacker News front page'}
              onChange={(e) => update(i, { highlights: e.target.value })}
            />
            <StrengthChipRow analyses={analyses} />
          </EntryCard>
        );
      })}
    </section>
  );
}

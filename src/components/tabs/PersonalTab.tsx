import { useResumeStore } from '../../store/useResumeStore';
import { Field } from '../shared/Field';
import { TextArea } from '../shared/TextArea';

export function PersonalTab() {
  const personal = useResumeStore((s) => s.data.personal);
  const setPersonal = useResumeStore((s) => s.setPersonal);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 880 }}>
      <header>
        <h2 style={{ fontFamily: 'var(--ff-display)', margin: 0, fontSize: '1.4rem' }}>
          Personal Information
        </h2>
        <p style={{ color: 'var(--text-1)', margin: '4px 0 0', fontSize: 13 }}>
          Required fields are marked with an asterisk.
        </p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field
          label="Full name *"
          value={personal.name}
          placeholder="Jane Doe"
          onChange={(e) => setPersonal('name', e.target.value)}
        />
        <Field
          label="Professional title *"
          value={personal.title}
          placeholder="Senior Software Engineer"
          onChange={(e) => setPersonal('title', e.target.value)}
        />
        <Field
          label="Email *"
          type="email"
          value={personal.email}
          placeholder="jane@example.com"
          onChange={(e) => setPersonal('email', e.target.value)}
        />
        <Field
          label="Phone"
          value={personal.phone}
          placeholder="+1 (555) 123-4567"
          onChange={(e) => setPersonal('phone', e.target.value)}
        />
        <Field
          label="Location"
          value={personal.location}
          placeholder="San Francisco, CA"
          onChange={(e) => setPersonal('location', e.target.value)}
        />
        <Field
          label="LinkedIn URL"
          value={personal.linkedin}
          placeholder="linkedin.com/in/janedoe"
          onChange={(e) => setPersonal('linkedin', e.target.value)}
        />
        <Field
          label="GitHub URL"
          value={personal.github}
          placeholder="github.com/janedoe"
          onChange={(e) => setPersonal('github', e.target.value)}
        />
        <Field
          label="Website / portfolio"
          value={personal.website}
          placeholder="janedoe.dev"
          onChange={(e) => setPersonal('website', e.target.value)}
        />
      </div>
      <TextArea
        label="Professional summary"
        value={personal.summary}
        rows={6}
        placeholder="A 3-5 sentence overview of your experience, focus areas, and career direction."
        onChange={(e) => setPersonal('summary', e.target.value)}
        hint="Sweet spot: 200-600 characters."
      />
    </section>
  );
}

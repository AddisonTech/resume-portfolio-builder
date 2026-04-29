import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Tabs, type TabDef } from './components/TabShell/Tabs';
import { CertsTab } from './components/tabs/CertsTab';
import { EducationTab } from './components/tabs/EducationTab';
import { ExperienceTab } from './components/tabs/ExperienceTab';
import { PersonalTab } from './components/tabs/PersonalTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { SkillsTab } from './components/tabs/SkillsTab';
import { useResumeStore } from './store/useResumeStore';

const FORM_TABS: TabDef[] = [
  { id: 'personal', label: 'Personal', glyph: '01', render: () => <PersonalTab /> },
  { id: 'education', label: 'Education', glyph: '02', render: () => <EducationTab /> },
  { id: 'experience', label: 'Experience', glyph: '03', render: () => <ExperienceTab /> },
  { id: 'skills', label: 'Skills', glyph: '04', render: () => <SkillsTab /> },
  { id: 'projects', label: 'Projects', glyph: '05', render: () => <ProjectsTab /> },
  { id: 'certs', label: 'Certifications', glyph: '06', render: () => <CertsTab /> },
];

export default function App() {
  const accent = useResumeStore((s) => s.accent);
  const darkMode = useResumeStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 300px) 1fr',
        minHeight: '100vh',
      }}
      className="app-shell"
    >
      <Sidebar />
      <main
        style={{
          padding: '24px 32px',
          minWidth: 0,
        }}
      >
        <Tabs tabs={FORM_TABS} />
      </main>
    </div>
  );
}

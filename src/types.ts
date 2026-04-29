// Resume domain model — mirrors the Python `_default()` shape so JSON
// payloads round-trip between the legacy Streamlit app and this React port.

export interface Personal {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  start_year: string;
  end_year: string;
  gpa: string;
  honors: string;
  relevant_courses: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
  achievements: string;
}

export interface SkillCategory {
  name: string;
  items: string;
}

export interface Skills {
  categories: SkillCategory[];
}

export interface Project {
  name: string;
  description: string;
  tech: string;
  github_url: string;
  live_url: string;
  highlights: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ResumeData {
  personal: Personal;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
}

export type TemplateName = 'Modern' | 'Classic' | 'Minimal';

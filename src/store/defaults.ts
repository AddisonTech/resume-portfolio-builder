import type {
  Certification,
  Education,
  Experience,
  Personal,
  Project,
  ResumeData,
  SkillCategory,
} from '../types';

export function emptyPersonal(): Personal {
  return {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
  };
}

export function emptyEducation(): Education {
  return {
    degree: '',
    field: '',
    institution: '',
    location: '',
    start_year: '',
    end_year: '',
    gpa: '',
    honors: '',
    relevant_courses: '',
  };
}

export function emptyExperience(): Experience {
  return {
    company: '',
    position: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    description: '',
    achievements: '',
  };
}

export function emptySkillCategory(): SkillCategory {
  return { name: '', items: '' };
}

export function emptyProject(): Project {
  return {
    name: '',
    description: '',
    tech: '',
    github_url: '',
    live_url: '',
    highlights: '',
  };
}

export function emptyCertification(): Certification {
  return { name: '', issuer: '', date: '', url: '' };
}

export function defaultResume(): ResumeData {
  return {
    personal: emptyPersonal(),
    education: [],
    experience: [],
    skills: { categories: [] },
    projects: [],
    certifications: [],
  };
}

import { create } from 'zustand';
import type {
  Certification,
  Education,
  Experience,
  Project,
  ResumeData,
  SkillCategory,
  TemplateName,
} from '../types';
import { defaultResume, emptyCertification, emptyEducation, emptyExperience, emptyProject, emptySkillCategory } from './defaults';
import { sampleResume } from './sample';
import { loadFromLocalStorage, saveToLocalStorage } from './persistence';

interface ResumeStoreState {
  data: ResumeData;
  template: TemplateName;
  accent: string;
  darkMode: boolean;
  jdText: string;
  abA: string;
  abB: string;
}

interface ResumeStoreActions {
  setData: (data: ResumeData) => void;
  setTemplate: (t: TemplateName) => void;
  setAccent: (a: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;

  loadSample: () => void;
  clearAll: () => void;

  setPersonal: <K extends keyof ResumeData['personal']>(k: K, v: ResumeData['personal'][K]) => void;
  setSummary: (v: string) => void;

  addEducation: () => void;
  updateEducation: (i: number, patch: Partial<Education>) => void;
  removeEducation: (i: number) => void;

  addExperience: () => void;
  updateExperience: (i: number, patch: Partial<Experience>) => void;
  removeExperience: (i: number) => void;

  addSkillCategory: () => void;
  updateSkillCategory: (i: number, patch: Partial<SkillCategory>) => void;
  removeSkillCategory: (i: number) => void;

  addProject: () => void;
  updateProject: (i: number, patch: Partial<Project>) => void;
  removeProject: (i: number) => void;

  addCertification: () => void;
  updateCertification: (i: number, patch: Partial<Certification>) => void;
  removeCertification: (i: number) => void;

  setJdText: (v: string) => void;
  setAbA: (v: string) => void;
  setAbB: (v: string) => void;
}

export type ResumeStore = ResumeStoreState & ResumeStoreActions;

const STORAGE_KEY = 'resume-portfolio-builder:v1';

interface PersistedState {
  data: ResumeData;
  template: TemplateName;
  accent: string;
  darkMode: boolean;
}

const persisted = loadFromLocalStorage<PersistedState>(STORAGE_KEY);

export const useResumeStore = create<ResumeStore>((set, get) => {
  const persist = () => {
    const { data, template, accent, darkMode } = get();
    saveToLocalStorage<PersistedState>(STORAGE_KEY, { data, template, accent, darkMode });
  };

  const update = (mutator: (s: ResumeStore) => Partial<ResumeStore>) => {
    set((s) => mutator(s));
    persist();
  };

  return {
    data: persisted?.data ?? defaultResume(),
    template: persisted?.template ?? 'Modern',
    accent: persisted?.accent ?? '#22d3ee',
    darkMode: persisted?.darkMode ?? true,
    jdText: '',
    abA: '',
    abB: '',

    setData: (data) => update(() => ({ data })),
    setTemplate: (template) => update(() => ({ template })),
    setAccent: (accent) => update(() => ({ accent })),
    toggleDarkMode: () => update((s) => ({ darkMode: !s.darkMode })),
    setDarkMode: (darkMode) => update(() => ({ darkMode })),

    loadSample: () => update(() => ({ data: sampleResume() })),
    clearAll: () => update(() => ({ data: defaultResume() })),

    setPersonal: (k, v) =>
      update((s) => ({ data: { ...s.data, personal: { ...s.data.personal, [k]: v } } })),
    setSummary: (v) =>
      update((s) => ({ data: { ...s.data, personal: { ...s.data.personal, summary: v } } })),

    addEducation: () =>
      update((s) => ({ data: { ...s.data, education: [...s.data.education, emptyEducation()] } })),
    updateEducation: (i, patch) =>
      update((s) => ({
        data: {
          ...s.data,
          education: s.data.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
        },
      })),
    removeEducation: (i) =>
      update((s) => ({
        data: { ...s.data, education: s.data.education.filter((_, idx) => idx !== i) },
      })),

    addExperience: () =>
      update((s) => ({
        data: { ...s.data, experience: [...s.data.experience, emptyExperience()] },
      })),
    updateExperience: (i, patch) =>
      update((s) => ({
        data: {
          ...s.data,
          experience: s.data.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
        },
      })),
    removeExperience: (i) =>
      update((s) => ({
        data: { ...s.data, experience: s.data.experience.filter((_, idx) => idx !== i) },
      })),

    addSkillCategory: () =>
      update((s) => ({
        data: {
          ...s.data,
          skills: { categories: [...s.data.skills.categories, emptySkillCategory()] },
        },
      })),
    updateSkillCategory: (i, patch) =>
      update((s) => ({
        data: {
          ...s.data,
          skills: {
            categories: s.data.skills.categories.map((c, idx) =>
              idx === i ? { ...c, ...patch } : c,
            ),
          },
        },
      })),
    removeSkillCategory: (i) =>
      update((s) => ({
        data: {
          ...s.data,
          skills: { categories: s.data.skills.categories.filter((_, idx) => idx !== i) },
        },
      })),

    addProject: () =>
      update((s) => ({ data: { ...s.data, projects: [...s.data.projects, emptyProject()] } })),
    updateProject: (i, patch) =>
      update((s) => ({
        data: {
          ...s.data,
          projects: s.data.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
        },
      })),
    removeProject: (i) =>
      update((s) => ({
        data: { ...s.data, projects: s.data.projects.filter((_, idx) => idx !== i) },
      })),

    addCertification: () =>
      update((s) => ({
        data: { ...s.data, certifications: [...s.data.certifications, emptyCertification()] },
      })),
    updateCertification: (i, patch) =>
      update((s) => ({
        data: {
          ...s.data,
          certifications: s.data.certifications.map((c, idx) =>
            idx === i ? { ...c, ...patch } : c,
          ),
        },
      })),
    removeCertification: (i) =>
      update((s) => ({
        data: {
          ...s.data,
          certifications: s.data.certifications.filter((_, idx) => idx !== i),
        },
      })),

    setJdText: (jdText) => set({ jdText }),
    setAbA: (abA) => set({ abA }),
    setAbB: (abB) => set({ abB }),
  };
});

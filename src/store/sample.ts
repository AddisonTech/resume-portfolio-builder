import type { ResumeData } from '../types';

export function sampleResume(): ResumeData {
  return {
    personal: {
      name: 'Jane Doe',
      title: 'Senior Software Engineer',
      email: 'jane@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/janedoe',
      github: 'github.com/janedoe',
      website: 'janedoe.dev',
      summary:
        'Experienced software engineer with 7+ years building scalable web applications and distributed systems. Passionate about clean code, developer experience, and mentoring junior engineers.',
    },
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        start_year: '2014',
        end_year: '2018',
        gpa: '3.9',
        honors: 'Magna Cum Laude',
        relevant_courses: 'Algorithms, Distributed Systems, Machine Learning',
      },
    ],
    experience: [
      {
        company: 'TechCorp Inc.',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        start_date: 'Mar 2021',
        end_date: 'Present',
        current: true,
        description:
          'Lead engineer on the platform team, responsible for core infrastructure and developer tooling.',
        achievements:
          'Reduced API p99 latency by 60% through caching and query optimization\n' +
          'Designed and shipped a new CI/CD pipeline cutting deploy time from 45 to 8 minutes\n' +
          'Mentored 4 junior engineers, all promoted within 18 months',
      },
      {
        company: 'StartupXYZ',
        position: 'Software Engineer',
        location: 'New York, NY',
        start_date: 'Jun 2018',
        end_date: 'Feb 2021',
        current: false,
        description: 'Full-stack engineer building the core product from 0 to 50k users.',
        achievements:
          'Built real-time collaboration features used by 50,000+ daily active users\n' +
          'Migrated monolith to microservices, improving deployment frequency 10x',
      },
    ],
    skills: {
      categories: [
        { name: 'Languages', items: 'Python, TypeScript, Go, SQL' },
        { name: 'Frameworks', items: 'FastAPI, React, Next.js, Django' },
        { name: 'Tools', items: 'Docker, Kubernetes, PostgreSQL, Redis, AWS' },
        { name: 'Practices', items: 'System Design, Code Review, Agile, TDD' },
      ],
    },
    projects: [
      {
        name: 'Awesome API',
        description:
          'A high-performance REST API framework with automatic OpenAPI docs, rate limiting, and observability built in.',
        tech: 'Python, FastAPI, PostgreSQL, Redis',
        github_url: 'github.com/janedoe/awesome-api',
        live_url: 'awesome-api.janedoe.dev',
        highlights:
          '500+ GitHub stars\n' +
          'Handles 20k+ requests/second on a single node\n' +
          'Used in production by 3 YC companies',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023',
        url: '',
      },
      {
        name: 'Certified Kubernetes Administrator',
        issuer: 'CNCF',
        date: '2022',
        url: '',
      },
    ],
  };
}

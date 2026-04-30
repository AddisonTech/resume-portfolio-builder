# Resume & Portfolio Builder

A fully client-side resume builder. Fill in your details, see live bullet-strength scores as you type, match your resume against any job description, A/B test rewrites of the same bullet, and export to PDF, HTML, or JSON. Nothing leaves the browser.

**Live demo:** https://addisontech.github.io/resume-portfolio-builder/

![App — main view](screenshots/app_main.png)

## Features

- Nine tabs: Personal, Education, Experience, Skills, Projects, Certifications, JD Match, A/B Test, Preview
- Live bullet analyzer — strong verb + quantified outcome + length sweet spot, scored as you type
- Job description matcher — paste a posting, get a score plus matched and missing keyword chips
- A/B bullet test — score two versions side by side with a dimension-by-dimension verdict
- Resume health meter — eight-bucket score out of 100 with breakdown
- Reorder controls on Education, Experience, and Project entries
- Three templates (Modern, Classic, Minimal) with a custom accent color picker
- Dark mode toggle and Normal/Compact density, persisted to localStorage along with all your form data
- Exports: standalone HTML, JSON, and PDF (PDF renderer is lazy-loaded so the initial bundle stays small)
- Schema-versioned JSON — exported files carry a version envelope and older shapes migrate forward on load

| Dark | Preview |
| --- | --- |
| ![Dark mode](screenshots/app_dark.png) | ![Preview tab](screenshots/app_preview.png) |

## Tech stack

- Vite + React 18 + TypeScript
- Zustand for state, with localStorage persistence and runtime schema validation
- @react-pdf/renderer for PDF export, dynamically imported on first click
- Vitest + jsdom for unit tests
- Deployed to GitHub Pages via the workflow in `.github/workflows/deploy.yml`

## Local development

```bash
npm install
npm run dev      # vite dev server on http://localhost:5173
npm test         # vitest run, ~30 parity tests
npm run build    # tsc -b && vite build, output in dist/
npm run preview  # serve the built dist/ locally
```

The deploy workflow runs on every push to `main`, builds the app, and publishes to GitHub Pages.

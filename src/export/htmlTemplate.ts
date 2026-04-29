// Standalone HTML resume generator. Direct port of generate_html() in app.py.
// Produces a self-contained HTML document the user can save or print.

import type { ResumeData, TemplateName } from '../types';

function esc(s: string | undefined | null): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ci(icon: string, val: string | undefined): string {
  return val ? `<span style="margin-right:18px">${icon} ${esc(val)}</span>` : '';
}

function secH(title: string, accent: string, tpl: TemplateName): string {
  if (tpl === 'Modern') {
    return (
      `<h2 style="color:${accent};border-bottom:2px solid ${accent};` +
      `padding-bottom:4px;margin:24px 0 12px">${esc(title)}</h2>`
    );
  }
  if (tpl === 'Classic') {
    return (
      `<h2 style="border-bottom:2px solid #222;padding-bottom:4px;` +
      `margin:24px 0 12px;text-transform:uppercase;letter-spacing:2px;` +
      `font-size:0.95em">${esc(title)}</h2>`
    );
  }
  return (
    `<h2 style="font-weight:300;font-size:1.1em;margin:28px 0 10px;` +
    `border-bottom:1px solid #e0e0e0;padding-bottom:6px;color:#333">${esc(title)}</h2>`
  );
}

function bulletsHtml(text: string): string {
  const items = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<li>${esc(l)}</li>`)
    .join('');
  if (!items) return '';
  return `<ul style="margin:6px 0 0;padding-left:18px;line-height:1.7">${items}</ul>`;
}

export function generateHtml(
  data: ResumeData,
  tpl: TemplateName,
  accent: string,
): string {
  const p = data.personal;
  const name = p.name || 'Your Name';
  const title = p.title || 'Professional Title';

  const contact =
    ci('✉', p.email) + ci('☎', p.phone) + ci('◉', p.location);
  const links =
    ci('in', p.linkedin) + ci('⌥', p.github) + ci('⌘', p.website);

  let header = '';
  if (tpl === 'Modern') {
    header = `
<div style="background:${accent};color:white;padding:36px 44px">
  <h1 style="margin:0 0 6px;font-size:2.2em;font-weight:700">${esc(name)}</h1>
  <p style="margin:0 0 16px;font-size:1.1em;opacity:.88;font-weight:300">${esc(title)}</p>
  <div style="font-size:.88em;opacity:.9">${contact}</div>
  <div style="font-size:.85em;opacity:.8;margin-top:4px">${links}</div>
</div>`;
  } else if (tpl === 'Classic') {
    const allContact = [p.email, p.phone, p.location, p.linkedin, p.github, p.website]
      .filter(Boolean)
      .map(esc)
      .join(' &nbsp;|&nbsp; ');
    header = `
<div style="text-align:center;padding:36px 44px 24px;border-bottom:3px double #222">
  <h1 style="margin:0 0 4px;font-size:2.4em;letter-spacing:3px;text-transform:uppercase">${esc(name)}</h1>
  <p style="margin:0 0 12px;font-size:1.05em;color:#555;font-style:italic">${esc(title)}</p>
  <p style="color:#444;font-size:.88em;margin:0">${allContact}</p>
</div>`;
  } else {
    const mc = [p.email, p.phone, p.location].filter(Boolean).map(esc).join(' &thinsp;&middot;&thinsp; ');
    header = `
<div style="padding:44px 44px 20px">
  <h1 style="margin:0 0 4px;font-size:2.8em;font-weight:300;letter-spacing:-1px;color:#111">${esc(name)}</h1>
  <p style="margin:0 0 8px;font-size:1.1em;color:${accent}">${esc(title)}</p>
  <p style="margin:0;color:#888;font-size:.88em">${mc}</p>
</div>`;
  }

  const body: string[] = [];

  if (p.summary) {
    body.push(secH('Summary', accent, tpl));
    body.push(`<p style="line-height:1.7;color:#333;margin:0">${esc(p.summary)}</p>`);
  }

  if (data.experience.length) {
    body.push(secH('Experience', accent, tpl));
    for (const exp of data.experience) {
      const dates = `${esc(exp.start_date)} &ndash; ${esc(exp.end_date)}`.replace(/^ &ndash; $| &ndash; $|^ &ndash; /g, '').trim();
      const achv = bulletsHtml(exp.achievements);
      const coColor = tpl === 'Modern' ? accent : '#555';
      let coStr = esc(exp.company);
      if (exp.location) coStr += ` &nbsp;|&nbsp; ${esc(exp.location)}`;
      const desc = exp.description
        ? `<p style="margin:0;line-height:1.7;color:#444;font-size:.92em">${esc(exp.description)}</p>`
        : '';
      body.push(`<div style="margin-bottom:18px">
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
    <strong style="font-size:.98em">${esc(exp.position)}</strong>
    <span style="color:#888;font-size:.85em">${dates}</span>
  </div>
  <div style="color:${coColor};font-size:.9em;margin:2px 0 4px">${coStr}</div>
  ${desc}
  ${achv}
</div>`);
    }
  }

  if (data.education.length) {
    body.push(secH('Education', accent, tpl));
    for (const edu of data.education) {
      let deg = esc(edu.degree);
      if (edu.field) deg += ` in ${esc(edu.field)}`;
      const dates = `${esc(edu.start_year)} &ndash; ${esc(edu.end_year)}`.replace(/^ &ndash; $| &ndash; $|^ &ndash; /g, '').trim();
      const meta: string[] = [];
      if (edu.institution) meta.push(esc(edu.institution));
      if (edu.location) meta.push(esc(edu.location));
      if (edu.gpa) meta.push(`GPA: ${esc(edu.gpa)}`);
      if (edu.honors) meta.push(esc(edu.honors));
      const metaColor = tpl === 'Modern' ? accent : '#555';
      const courses = edu.relevant_courses
        ? `<p style="margin:2px 0 0;color:#888;font-size:.82em">Courses: ${esc(edu.relevant_courses)}</p>`
        : '';
      body.push(`<div style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
    <strong>${deg}</strong>
    <span style="color:#888;font-size:.85em">${dates}</span>
  </div>
  <div style="color:${metaColor};font-size:.9em;margin:2px 0">${meta.join(' &nbsp;|&nbsp; ')}</div>
  ${courses}
</div>`);
    }
  }

  if (data.skills.categories.length) {
    body.push(secH('Skills', accent, tpl));
    let rows = '';
    for (const cat of data.skills.categories) {
      if (cat.name || cat.items) {
        const cc = tpl === 'Modern' ? accent : '#333';
        rows +=
          `<tr><td style="padding:3px 16px 3px 0;font-weight:600;` +
          `white-space:nowrap;vertical-align:top;color:${cc};min-width:110px">` +
          `${esc(cat.name)}</td>` +
          `<td style="padding:3px 0;line-height:1.7;color:#444">${esc(cat.items)}</td></tr>`;
      }
    }
    body.push(`<table style="border-collapse:collapse;width:100%">${rows}</table>`);
  }

  if (data.projects.length) {
    body.push(secH('Projects', accent, tpl));
    for (const proj of data.projects) {
      const linkParts: string[] = [];
      if (proj.github_url) linkParts.push(`<a href="${esc(proj.github_url)}" style="color:${accent}">GitHub</a>`);
      if (proj.live_url) linkParts.push(`<a href="${esc(proj.live_url)}" style="color:${accent}">Live Demo</a>`);
      const linksHtml = linkParts.length
        ? ` &nbsp;<span style="font-size:.82em">${linkParts.join('&nbsp;|&nbsp;')}</span>`
        : '';
      const hi = bulletsHtml(proj.highlights);
      const techStr = proj.tech
        ? ` &nbsp;<span style="color:#888;font-size:.88em">${esc(proj.tech)}</span>`
        : '';
      const desc = proj.description
        ? `<p style="margin:4px 0 0;line-height:1.7;color:#444;font-size:.92em">${esc(proj.description)}</p>`
        : '';
      body.push(`<div style="margin-bottom:16px">
  <div><strong>${esc(proj.name)}</strong>${techStr}${linksHtml}</div>
  ${desc}
  ${hi}
</div>`);
    }
  }

  if (data.certifications.length) {
    body.push(secH('Certifications', accent, tpl));
    for (const cert of data.certifications) {
      const cred = cert.url
        ? ` &nbsp;<a href="${esc(cert.url)}" style="color:${accent};font-size:.82em">View</a>`
        : '';
      const issuer = cert.issuer
        ? ` &nbsp;<span style="color:#666;font-size:.9em">&mdash; ${esc(cert.issuer)}</span>`
        : '';
      body.push(`<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
  <div><strong>${esc(cert.name)}</strong>${issuer}${cred}</div>
  <span style="color:#888;font-size:.85em">${esc(cert.date)}</span>
</div>`);
    }
  }

  const bodyHtml = body.join('\n');
  const font =
    tpl === 'Classic'
      ? "Georgia, 'Times New Roman', serif"
      : 'Inter, system-ui, -apple-system, sans-serif';
  const bg = tpl === 'Modern' ? '#f4f5f7' : 'white';
  const shadow = tpl === 'Modern' ? 'box-shadow:0 4px 32px rgba(0,0,0,.10);' : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(name)} - Resume</title>
<style>
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:${font}; background:${bg}; color:#1a1a1a; font-size:14px; line-height:1.5; }
  .wrap { max-width:820px; margin:0 auto; background:white; ${shadow} }
  .body { padding:44px; }
  a { text-decoration:none; }
  a:hover { text-decoration:underline; }
  @media print { body { background:white; } .wrap { box-shadow:none; } }
</style>
</head>
<body>
<div class="wrap">
${header}
<div class="body">
${bodyHtml}
</div>
</div>
</body>
</html>`;
}

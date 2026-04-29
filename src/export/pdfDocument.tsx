// PDF document for @react-pdf/renderer. Mirrors the polished generate_pdf
// from app.py — Helvetica family, accent-colored 2-tone dividers, two-column
// dates, accent bullet glyph.

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ResumeData } from '../types';

// Color palette ported verbatim from app.py.
const INK_900 = 'rgb(15, 23, 42)';
const INK_700 = 'rgb(51, 65, 85)';
const INK_500 = 'rgb(100, 116, 139)';
const INK_300 = 'rgb(203, 213, 225)';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK_700,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    lineHeight: 1.4,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: INK_900,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: INK_500,
    marginTop: 1,
  },
  headerDivider: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 6,
  },
  headerSwatch: {
    height: 1.2,
    width: 56,
  },
  headerHair: {
    height: 0.6,
    flex: 1,
    backgroundColor: INK_300,
    alignSelf: 'flex-end',
  },
  sectionHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: INK_900,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionDivider: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  secSwatch: {
    height: 1,
    width: 28,
  },
  secHair: {
    height: 0.5,
    flex: 1,
    backgroundColor: INK_300,
    alignSelf: 'flex-end',
  },
  itemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: INK_900,
    flexShrink: 1,
    flexGrow: 1,
  },
  itemDate: {
    fontSize: 9,
    color: INK_500,
    marginLeft: 8,
  },
  subLine: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9.5,
    color: INK_500,
    marginTop: 1,
    marginBottom: 2,
  },
  body: {
    fontSize: 9.7,
    color: INK_700,
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 1,
  },
  bulletGlyph: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.7,
    width: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.7,
    color: INK_700,
  },
  spacer: {
    height: 6,
  },
  smallSpacer: {
    height: 4,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  skillCat: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.6,
    width: 90,
  },
  skillItems: {
    fontSize: 9.6,
    color: INK_700,
    flex: 1,
  },
  projTechRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projTech: {
    fontSize: 9,
    marginLeft: 6,
  },
  projLinks: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8.5,
    color: INK_500,
    marginTop: 1,
  },
});

function bulletsFromText(text: string): string[] {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function SectionHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <View>
      <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
      <View style={styles.sectionDivider}>
        <View style={[styles.secSwatch, { backgroundColor: accent }]} />
        <View style={styles.secHair} />
      </View>
    </View>
  );
}

interface DocProps {
  data: ResumeData;
  accent: string;
}

export function ResumePdfDocument({ data, accent }: DocProps) {
  const p = data.personal;
  const contactItems = [p.email, p.phone, p.location].filter(Boolean).join('   ');
  const linkItems = [p.linkedin, p.github, p.website].filter(Boolean).join('   ');

  return (
    <Document title={`${p.name || 'resume'} - resume`}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{p.name}</Text>
        {p.title ? (
          <Text style={[styles.jobTitle, { color: accent }]}>{p.title}</Text>
        ) : null}
        {contactItems ? <Text style={styles.contact}>{contactItems}</Text> : null}
        {linkItems ? <Text style={styles.contact}>{linkItems}</Text> : null}

        <View style={styles.headerDivider}>
          <View style={[styles.headerSwatch, { backgroundColor: accent }]} />
          <View style={styles.headerHair} />
        </View>

        {p.summary ? (
          <View>
            <SectionHeader title="Summary" accent={accent} />
            <Text style={styles.body}>{p.summary}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 && (
          <View>
            <SectionHeader title="Experience" accent={accent} />
            {data.experience.map((exp, i) => {
              const dates = `${exp.start_date || ''} - ${exp.end_date || ''}`.replace(/^- |- $/g, '').trim();
              const co = [exp.company, exp.location].filter(Boolean).join('  |  ');
              return (
                <View key={i} wrap={false} style={{ marginBottom: 6 }}>
                  <View style={styles.itemHead}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemDate}>{dates}</Text>
                  </View>
                  {co ? <Text style={styles.subLine}>{co}</Text> : null}
                  {exp.description ? <Text style={styles.body}>{exp.description}</Text> : null}
                  {bulletsFromText(exp.achievements).map((line, j) => (
                    <View key={j} style={styles.bulletRow}>
                      <Text style={[styles.bulletGlyph, { color: accent }]}>{'-  '}</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {data.education.length > 0 && (
          <View>
            <SectionHeader title="Education" accent={accent} />
            {data.education.map((edu, i) => {
              const deg = `${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`;
              const dates = `${edu.start_year || ''} - ${edu.end_year || ''}`.replace(/^- |- $/g, '').trim();
              const meta = [edu.institution, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors]
                .filter(Boolean)
                .join('  |  ');
              return (
                <View key={i} wrap={false} style={{ marginBottom: 6 }}>
                  <View style={styles.itemHead}>
                    <Text style={styles.itemTitle}>{deg}</Text>
                    <Text style={styles.itemDate}>{dates}</Text>
                  </View>
                  {meta ? <Text style={styles.subLine}>{meta}</Text> : null}
                  {edu.relevant_courses ? (
                    <Text style={styles.body}>Courses: {edu.relevant_courses}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {data.skills.categories.length > 0 && (
          <View>
            <SectionHeader title="Skills" accent={accent} />
            {data.skills.categories.map((cat, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={[styles.skillCat, { color: accent }]}>{cat.name}</Text>
                <Text style={styles.skillItems}>{cat.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View>
            <SectionHeader title="Projects" accent={accent} />
            {data.projects.map((proj, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 6 }}>
                <View style={styles.projTechRow}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {proj.tech ? (
                    <Text style={[styles.projTech, { color: accent }]}>{proj.tech}</Text>
                  ) : null}
                </View>
                {proj.description ? <Text style={styles.body}>{proj.description}</Text> : null}
                {bulletsFromText(proj.highlights).map((line, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={[styles.bulletGlyph, { color: accent }]}>{'-  '}</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
                {(proj.github_url || proj.live_url) && (
                  <Text style={styles.projLinks}>
                    {[proj.github_url, proj.live_url].filter(Boolean).join('  |  ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {data.certifications.length > 0 && (
          <View>
            <SectionHeader title="Certifications" accent={accent} />
            {data.certifications.map((cert, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 4 }}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  <Text style={styles.itemDate}>{cert.date}</Text>
                </View>
                {cert.issuer ? <Text style={styles.subLine}>{cert.issuer}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

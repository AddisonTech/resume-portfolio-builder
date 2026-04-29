"""
Resume & Portfolio Builder
Built with Streamlit + fpdf2
"""

import json
import streamlit as st
import streamlit.components.v1 as components

from analyzers import (
    analyze_achievements_block,
    render_strength_chip,
    score_resume_health,
)
from jd_match import (
    extract_jd_keywords,
    match_resume,
    render_chip_row,
)

st.set_page_config(
    page_title="Resume & Portfolio Builder",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = False

_dark = st.session_state.dark_mode
_dark_css = """
    .stApp                                          { background-color: #0e1117 !important; color: #e8eaf0 !important; }
    section[data-testid="stSidebar"]                { background-color: #161922 !important; }
    section[data-testid="stSidebar"] *              { color: #e8eaf0 !important; }
    .stTabs [data-baseweb="tab-list"]               { background-color: #0e1117; }
    .stTabs [data-baseweb="tab"]                    { color: #9ca3af !important; }
    .stTabs [aria-selected="true"]                  { color: #e8eaf0 !important; }
    .stTextInput  input,
    .stTextArea   textarea,
    .stSelectbox  > div > div                       { background-color: #1e2130 !important;
                                                      color: #e8eaf0 !important;
                                                      border-color: #374151 !important; }
    .stExpander                                     { background-color: #1a1d27 !important;
                                                      border-color: #2d3748 !important; }
    .streamlit-expanderHeader,
    .streamlit-expanderHeader p                     { color: #e8eaf0 !important; }
    .stButton > button,
    .stDownloadButton > button                      { background-color: #1e2130 !important;
                                                      color: #e8eaf0 !important;
                                                      border-color: #374151 !important; }
    .stFileUploader > div                           { background-color: #1e2130 !important;
                                                      border-color: #374151 !important; }
    div[data-testid="stMarkdownContainer"] p,
    div[data-testid="stMarkdownContainer"] h1,
    div[data-testid="stMarkdownContainer"] h2       { color: #e8eaf0 !important; }
    label, .stCheckbox p                            { color: #e8eaf0 !important; }
    .stCaption, .stCaption p                        { color: #9ca3af !important; }
    hr                                              { border-color: #2d3748 !important; }
""" if _dark else ""

st.markdown(f"""
<style>
    .block-container {{ padding-top: 1rem; }}
    h1 {{ font-size: 1.8rem !important; }}
    h2 {{ font-size: 1.3rem !important; }}
    {_dark_css}
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# Data helpers
# ─────────────────────────────────────────────────────────────────────────────

def _default() -> dict:
    return {
        "personal": {
            "name": "", "title": "", "email": "", "phone": "",
            "location": "", "linkedin": "", "github": "",
            "website": "", "summary": "",
        },
        "education": [],
        "experience": [],
        "skills": {"categories": []},
        "projects": [],
        "certifications": [],
    }


def _sample() -> dict:
    return {
        "personal": {
            "name": "Jane Doe",
            "title": "Senior Software Engineer",
            "email": "jane@example.com",
            "phone": "+1 (555) 123-4567",
            "location": "San Francisco, CA",
            "linkedin": "linkedin.com/in/janedoe",
            "github": "github.com/janedoe",
            "website": "janedoe.dev",
            "summary": (
                "Experienced software engineer with 7+ years building scalable web "
                "applications and distributed systems. Passionate about clean code, "
                "developer experience, and mentoring junior engineers."
            ),
        },
        "education": [
            {
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "institution": "University of California, Berkeley",
                "location": "Berkeley, CA",
                "start_year": "2014",
                "end_year": "2018",
                "gpa": "3.9",
                "honors": "Magna Cum Laude",
                "relevant_courses": "Algorithms, Distributed Systems, Machine Learning",
            }
        ],
        "experience": [
            {
                "company": "TechCorp Inc.",
                "position": "Senior Software Engineer",
                "location": "San Francisco, CA",
                "start_date": "Mar 2021",
                "end_date": "Present",
                "current": True,
                "description": "Lead engineer on the platform team, responsible for core infrastructure and developer tooling.",
                "achievements": (
                    "Reduced API p99 latency by 60% through caching and query optimization\n"
                    "Designed and shipped a new CI/CD pipeline cutting deploy time from 45 to 8 minutes\n"
                    "Mentored 4 junior engineers, all promoted within 18 months"
                ),
            },
            {
                "company": "StartupXYZ",
                "position": "Software Engineer",
                "location": "New York, NY",
                "start_date": "Jun 2018",
                "end_date": "Feb 2021",
                "current": False,
                "description": "Full-stack engineer building the core product from 0 to 50k users.",
                "achievements": (
                    "Built real-time collaboration features used by 50,000+ daily active users\n"
                    "Migrated monolith to microservices, improving deployment frequency 10x"
                ),
            },
        ],
        "skills": {
            "categories": [
                {"name": "Languages",  "items": "Python, TypeScript, Go, SQL"},
                {"name": "Frameworks", "items": "FastAPI, React, Next.js, Django"},
                {"name": "Tools",      "items": "Docker, Kubernetes, PostgreSQL, Redis, AWS"},
                {"name": "Practices",  "items": "System Design, Code Review, Agile, TDD"},
            ]
        },
        "projects": [
            {
                "name": "Awesome API",
                "description": "A high-performance REST API framework with automatic OpenAPI docs, rate limiting, and observability built in.",
                "tech": "Python, FastAPI, PostgreSQL, Redis",
                "github_url": "github.com/janedoe/awesome-api",
                "live_url": "awesome-api.janedoe.dev",
                "highlights": (
                    "500+ GitHub stars\n"
                    "Handles 20k+ requests/second on a single node\n"
                    "Used in production by 3 YC companies"
                ),
            }
        ],
        "certifications": [
            {"name": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services", "date": "2023", "url": ""},
            {"name": "Certified Kubernetes Administrator",  "issuer": "CNCF",               "date": "2022", "url": ""},
        ],
    }


if "data" not in st.session_state:
    st.session_state.data = _default()

D = st.session_state.data


# ─────────────────────────────────────────────────────────────────────────────
# HTML Generation
# ─────────────────────────────────────────────────────────────────────────────

def _sec_h(title: str, accent: str, tpl: str) -> str:
    if tpl == "Modern":
        return (
            f'<h2 style="color:{accent};border-bottom:2px solid {accent};'
            f'padding-bottom:4px;margin:24px 0 12px">{title}</h2>'
        )
    if tpl == "Classic":
        return (
            f'<h2 style="border-bottom:2px solid #222;padding-bottom:4px;'
            f'margin:24px 0 12px;text-transform:uppercase;letter-spacing:2px;'
            f'font-size:0.95em">{title}</h2>'
        )
    # Minimal
    return (
        f'<h2 style="font-weight:300;font-size:1.1em;margin:28px 0 10px;'
        f'border-bottom:1px solid #e0e0e0;padding-bottom:6px;color:#333">{title}</h2>'
    )


def generate_html(data: dict, tpl: str, accent: str) -> str:
    p = data["personal"]
    name  = p.get("name")  or "Your Name"
    title = p.get("title") or "Professional Title"

    def ci(icon, val):
        return f'<span style="margin-right:18px">{icon} {val}</span>' if val else ""

    contact = "".join([ci("✉", p.get("email")), ci("📞", p.get("phone")), ci("📍", p.get("location"))])
    links   = "".join([ci("in", p.get("linkedin")), ci("⌥", p.get("github")),  ci("🌐", p.get("website"))])

    if tpl == "Modern":
        header = f"""
<div style="background:{accent};color:white;padding:36px 44px">
  <h1 style="margin:0 0 6px;font-size:2.2em;font-weight:700">{name}</h1>
  <p style="margin:0 0 16px;font-size:1.1em;opacity:.88;font-weight:300">{title}</p>
  <div style="font-size:.88em;opacity:.9">{contact}</div>
  <div style="font-size:.85em;opacity:.8;margin-top:4px">{links}</div>
</div>"""
    elif tpl == "Classic":
        all_contact = " &nbsp;|&nbsp; ".join(
            x for x in [p.get("email"), p.get("phone"), p.get("location"),
                         p.get("linkedin"), p.get("github"), p.get("website")] if x
        )
        header = f"""
<div style="text-align:center;padding:36px 44px 24px;border-bottom:3px double #222">
  <h1 style="margin:0 0 4px;font-size:2.4em;letter-spacing:3px;text-transform:uppercase">{name}</h1>
  <p style="margin:0 0 12px;font-size:1.05em;color:#555;font-style:italic">{title}</p>
  <p style="color:#444;font-size:.88em;margin:0">{all_contact}</p>
</div>"""
    else:  # Minimal
        mc = " &thinsp;&middot;&thinsp; ".join(
            x for x in [p.get("email"), p.get("phone"), p.get("location")] if x
        )
        header = f"""
<div style="padding:44px 44px 20px">
  <h1 style="margin:0 0 4px;font-size:2.8em;font-weight:300;letter-spacing:-1px;color:#111">{name}</h1>
  <p style="margin:0 0 8px;font-size:1.1em;color:{accent}">{title}</p>
  <p style="margin:0;color:#888;font-size:.88em">{mc}</p>
</div>"""

    body = []

    if p.get("summary"):
        body.append(_sec_h("Summary", accent, tpl))
        body.append(f'<p style="line-height:1.7;color:#333;margin:0">{p["summary"]}</p>')

    if data["experience"]:
        body.append(_sec_h("Experience", accent, tpl))
        for exp in data["experience"]:
            dates = f'{exp.get("start_date","")} &ndash; {exp.get("end_date","")}'.strip(" &ndash;")
            achv = ""
            if exp.get("achievements"):
                bl = "".join(f"<li>{ln.strip()}</li>" for ln in exp["achievements"].split("\n") if ln.strip())
                achv = f'<ul style="margin:6px 0 0;padding-left:18px;line-height:1.7">{bl}</ul>'
            co_color = accent if tpl == "Modern" else "#555"
            co_str = exp.get("company", "")
            if exp.get("location"):
                co_str += f' &nbsp;|&nbsp; {exp["location"]}'
            body.append(f"""<div style="margin-bottom:18px">
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
    <strong style="font-size:.98em">{exp.get("position","")}</strong>
    <span style="color:#888;font-size:.85em">{dates}</span>
  </div>
  <div style="color:{co_color};font-size:.9em;margin:2px 0 4px">{co_str}</div>
  {f'<p style="margin:0;line-height:1.7;color:#444;font-size:.92em">{exp["description"]}</p>' if exp.get("description") else ""}
  {achv}
</div>""")

    if data["education"]:
        body.append(_sec_h("Education", accent, tpl))
        for edu in data["education"]:
            deg = edu.get("degree", "")
            if edu.get("field"):
                deg += f' in {edu["field"]}'
            dates = f'{edu.get("start_year","")} &ndash; {edu.get("end_year","")}'.strip(" &ndash;")
            meta = [edu.get("institution", "")]
            if edu.get("location"):  meta.append(edu["location"])
            if edu.get("gpa"):       meta.append(f'GPA: {edu["gpa"]}')
            if edu.get("honors"):    meta.append(edu["honors"])
            meta_color = accent if tpl == "Modern" else "#555"
            courses = f'<p style="margin:2px 0 0;color:#888;font-size:.82em">Courses: {edu["relevant_courses"]}</p>' if edu.get("relevant_courses") else ""
            body.append(f"""<div style="margin-bottom:14px">
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px">
    <strong>{deg}</strong>
    <span style="color:#888;font-size:.85em">{dates}</span>
  </div>
  <div style="color:{meta_color};font-size:.9em;margin:2px 0">{" &nbsp;|&nbsp; ".join(m for m in meta if m)}</div>
  {courses}
</div>""")

    if data["skills"]["categories"]:
        body.append(_sec_h("Skills", accent, tpl))
        rows = ""
        for cat in data["skills"]["categories"]:
            if cat.get("name") or cat.get("items"):
                cc = accent if tpl == "Modern" else "#333"
                rows += (
                    f'<tr><td style="padding:3px 16px 3px 0;font-weight:600;'
                    f'white-space:nowrap;vertical-align:top;color:{cc};min-width:110px">'
                    f'{cat.get("name","")}</td>'
                    f'<td style="padding:3px 0;line-height:1.7;color:#444">'
                    f'{cat.get("items","")}</td></tr>'
                )
        body.append(f'<table style="border-collapse:collapse;width:100%">{rows}</table>')

    if data["projects"]:
        body.append(_sec_h("Projects", accent, tpl))
        for proj in data["projects"]:
            link_parts = []
            if proj.get("github_url"): link_parts.append(f'<a href="{proj["github_url"]}" style="color:{accent}">GitHub</a>')
            if proj.get("live_url"):   link_parts.append(f'<a href="{proj["live_url"]}"   style="color:{accent}">Live Demo</a>')
            links_html = f' &nbsp;<span style="font-size:.82em">{"&nbsp;|&nbsp;".join(link_parts)}</span>' if link_parts else ""
            hi = ""
            if proj.get("highlights"):
                bl = "".join(f"<li>{ln.strip()}</li>" for ln in proj["highlights"].split("\n") if ln.strip())
                hi = f'<ul style="margin:6px 0 0;padding-left:18px;line-height:1.7">{bl}</ul>'
            tech_str = f' &nbsp;<span style="color:#888;font-size:.88em">{proj["tech"]}</span>' if proj.get("tech") else ""
            body.append(f"""<div style="margin-bottom:16px">
  <div><strong>{proj.get("name","")}</strong>{tech_str}{links_html}</div>
  {f'<p style="margin:4px 0 0;line-height:1.7;color:#444;font-size:.92em">{proj["description"]}</p>' if proj.get("description") else ""}
  {hi}
</div>""")

    if data["certifications"]:
        body.append(_sec_h("Certifications", accent, tpl))
        for cert in data["certifications"]:
            cred = f' &nbsp;<a href="{cert["url"]}" style="color:{accent};font-size:.82em">View</a>' if cert.get("url") else ""
            issuer_str = f' &nbsp;<span style="color:#666;font-size:.9em">&mdash; {cert["issuer"]}</span>' if cert.get("issuer") else ""
            body.append(f"""<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
  <div><strong>{cert.get("name","")}</strong>{issuer_str}{cred}</div>
  <span style="color:#888;font-size:.85em">{cert.get("date","")}</span>
</div>""")

    body_html = "\n".join(body)
    font = "Inter, system-ui, -apple-system, sans-serif" if tpl != "Classic" else "Georgia, 'Times New Roman', serif"
    bg   = "#f4f5f7" if tpl == "Modern" else "white"
    shadow = "box-shadow:0 4px 32px rgba(0,0,0,.10);" if tpl == "Modern" else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} - Resume</title>
<style>
  *, *::before, *::after {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ font-family:{font}; background:{bg}; color:#1a1a1a; font-size:14px; line-height:1.5; }}
  .wrap {{ max-width:820px; margin:0 auto; background:white; {shadow} }}
  .body {{ padding:44px; }}
  a {{ text-decoration:none; }}
  a:hover {{ text-decoration:underline; }}
  @media print {{ body {{ background:white; }} .wrap {{ box-shadow:none; }} }}
</style>
</head>
<body>
<div class="wrap">
{header}
<div class="body">
{body_html}
</div>
</div>
</body>
</html>"""


# ─────────────────────────────────────────────────────────────────────────────
# PDF Generation
# ─────────────────────────────────────────────────────────────────────────────

def _safe(text: str) -> str:
    """Encode text to latin-1 for core fpdf fonts, replacing unknown chars."""
    return (text or "").encode("latin-1", errors="replace").decode("latin-1")


def generate_pdf(data: dict) -> bytes:
    from fpdf import FPDF

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(20, 20, 20)
    pdf.add_page()

    p    = data["personal"]
    EW   = pdf.w - 2 * pdf.l_margin  # effective width (~170 mm)
    LM   = pdf.l_margin

    # ── helpers ──────────────────────────────────────────────────────────────

    def sec_header(title: str):
        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(25, 25, 25)
        pdf.cell(0, 7, title.upper(), new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(160, 160, 160)
        pdf.line(LM, pdf.get_y(), LM + EW, pdf.get_y())
        pdf.ln(3)

    def two_cell(left: str, right: str, bold_left: bool = True, sz_l: int = 10, sz_r: int = 9):
        pdf.set_font("Helvetica", "B" if bold_left else "", sz_l)
        pdf.set_text_color(25, 25, 25)
        rw = pdf.get_string_width(_safe(right)) + 4
        pdf.cell(EW - rw, 6, _safe(left), new_x="RIGHT", new_y="TOP")
        pdf.set_font("Helvetica", "", sz_r)
        pdf.set_text_color(130, 130, 130)
        pdf.cell(rw, 6, _safe(right), align="R", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(50, 50, 50)

    def sub_line(text: str):
        pdf.set_font("Helvetica", "I", 9.5)
        pdf.set_text_color(90, 90, 90)
        pdf.cell(0, 5, _safe(text), new_x="LMARGIN", new_y="NEXT")

    def body_text(text: str):
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(60, 60, 60)
        pdf.multi_cell(0, 5, _safe(text))

    def bullets(text: str):
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
            pdf.set_font("Helvetica", "", 9.5)
            pdf.set_text_color(60, 60, 60)
            pdf.cell(5, 5, "-", new_x="RIGHT", new_y="TOP")
            pdf.multi_cell(EW - 5, 5, _safe(line))

    # ── Name / header ────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 10, _safe(p.get("name", "")), new_x="LMARGIN", new_y="NEXT")

    if p.get("title"):
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 6, _safe(p["title"]), new_x="LMARGIN", new_y="NEXT")

    contact_items = [x for x in [p.get("email"), p.get("phone"), p.get("location")] if x]
    if contact_items:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(110, 110, 110)
        pdf.cell(0, 5, "  |  ".join(_safe(c) for c in contact_items), new_x="LMARGIN", new_y="NEXT")

    link_items = [x for x in [p.get("linkedin"), p.get("github"), p.get("website")] if x]
    if link_items:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(110, 110, 110)
        pdf.cell(0, 5, "  |  ".join(_safe(l) for l in link_items), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(3)
    pdf.set_draw_color(180, 180, 180)
    pdf.line(LM, pdf.get_y(), LM + EW, pdf.get_y())

    # ── Summary ──────────────────────────────────────────────────────────────
    if p.get("summary"):
        sec_header("Summary")
        body_text(p["summary"])

    # ── Experience ───────────────────────────────────────────────────────────
    if data["experience"]:
        sec_header("Experience")
        for exp in data["experience"]:
            dates = f'{exp.get("start_date","")} - {exp.get("end_date","")}'.strip(" -")
            two_cell(exp.get("position", ""), dates)
            co = exp.get("company", "")
            if exp.get("location"):
                co += f'  |  {exp["location"]}'
            if co:
                sub_line(co)
            if exp.get("description"):
                body_text(exp["description"])
            if exp.get("achievements"):
                bullets(exp["achievements"])
            pdf.ln(3)

    # ── Education ────────────────────────────────────────────────────────────
    if data["education"]:
        sec_header("Education")
        for edu in data["education"]:
            deg = edu.get("degree", "")
            if edu.get("field"):
                deg += f' in {edu["field"]}'
            dates = f'{edu.get("start_year","")} - {edu.get("end_year","")}'.strip(" -")
            two_cell(deg, dates)
            meta = [edu.get("institution", "")]
            if edu.get("location"): meta.append(edu["location"])
            if edu.get("gpa"):      meta.append(f'GPA: {edu["gpa"]}')
            if edu.get("honors"):   meta.append(edu["honors"])
            sub_line("  |  ".join(m for m in meta if m))
            if edu.get("relevant_courses"):
                body_text(f'Courses: {edu["relevant_courses"]}')
            pdf.ln(3)

    # ── Skills ───────────────────────────────────────────────────────────────
    if data["skills"]["categories"]:
        sec_header("Skills")
        CAT_W = 42
        for cat in data["skills"]["categories"]:
            if cat.get("name") or cat.get("items"):
                pdf.set_font("Helvetica", "B", 9.5)
                pdf.set_text_color(30, 30, 30)
                pdf.cell(CAT_W, 5, _safe(cat.get("name", "")), new_x="RIGHT", new_y="TOP")
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(60, 60, 60)
                pdf.multi_cell(EW - CAT_W, 5, _safe(cat.get("items", "")))
        pdf.ln(2)

    # ── Projects ─────────────────────────────────────────────────────────────
    if data["projects"]:
        sec_header("Projects")
        for proj in data["projects"]:
            title_str = proj.get("name", "")
            if proj.get("tech"):
                title_str += f'  |  {proj["tech"]}'
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(25, 25, 25)
            pdf.cell(0, 6, _safe(title_str), new_x="LMARGIN", new_y="NEXT")
            if proj.get("description"):
                body_text(proj["description"])
            if proj.get("highlights"):
                bullets(proj["highlights"])
            proj_links = [x for x in [proj.get("github_url"), proj.get("live_url")] if x]
            if proj_links:
                pdf.set_font("Helvetica", "I", 8.5)
                pdf.set_text_color(120, 120, 120)
                pdf.cell(0, 5, "  |  ".join(_safe(l) for l in proj_links), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(3)

    # ── Certifications ───────────────────────────────────────────────────────
    if data["certifications"]:
        sec_header("Certifications")
        for cert in data["certifications"]:
            two_cell(cert.get("name", ""), cert.get("date", ""))
            if cert.get("issuer"):
                sub_line(cert["issuer"])
            pdf.ln(2)

    return bytes(pdf.output())


# ─────────────────────────────────────────────────────────────────────────────
# Sidebar
# ─────────────────────────────────────────────────────────────────────────────

with st.sidebar:
    st.title("📄 Resume Builder")
    st.markdown("---")

    dark_toggled = st.toggle("🌙 Dark Mode", value=st.session_state.dark_mode)
    if dark_toggled != st.session_state.dark_mode:
        st.session_state.dark_mode = dark_toggled
        st.rerun()

    st.markdown("---")
    template = st.selectbox("Template", ["Modern", "Classic", "Minimal"], index=0)
    accent   = st.color_picker("Accent Color", "#2563EB")

    st.markdown("---")
    st.subheader("Data")

    col_a, col_b = st.columns(2)
    with col_a:
        if st.button("📋 Sample Data", use_container_width=True, help="Load example resume"):
            st.session_state.data = _sample()
            st.rerun()
    with col_b:
        if st.button("🗑 Clear All", use_container_width=True, help="Reset all fields"):
            st.session_state.data = _default()
            st.rerun()

    st.download_button(
        "💾 Save as JSON",
        json.dumps(D, indent=2),
        "resume.json",
        "application/json",
        use_container_width=True,
    )

    st.markdown("---")
    st.subheader("Resume Health")
    _health = score_resume_health(D)
    st.progress(_health["score"] / 100, text=f"{_health['score']}/100")
    with st.expander("Score breakdown"):
        for row in _health["breakdown"]:
            st.markdown(
                f"**{row['label']}** — {row['pts']}/{row['max']}  \n"
                f"<span style='color:#94a3b8;font-size:.85em'>{row['note']}</span>",
                unsafe_allow_html=True,
            )

    uploaded = st.file_uploader("Load saved JSON", type="json")
    if uploaded is not None:
        try:
            loaded = json.load(uploaded)
            st.session_state.data = loaded
            st.rerun()
        except Exception as e:
            st.error(f"Could not load file: {e}")

    st.markdown("---")
    st.caption("Built with [Streamlit](https://streamlit.io) & fpdf2")


# ─────────────────────────────────────────────────────────────────────────────
# Main Tabs
# ─────────────────────────────────────────────────────────────────────────────

T_PERSONAL, T_EDU, T_EXP, T_SKILLS, T_PROJ, T_CERTS, T_MATCH, T_PREVIEW = st.tabs([
    "👤 Personal",
    "🎓 Education",
    "💼 Experience",
    "🛠️ Skills",
    "🚀 Projects",
    "🏆 Certifications",
    "🎯 JD Match",
    "👁️ Preview & Export",
])


# ── Personal ─────────────────────────────────────────────────────────────────
with T_PERSONAL:
    st.header("Personal Information")
    p = D["personal"]

    c1, c2 = st.columns(2)
    with c1:
        p["name"]     = st.text_input("Full Name *",          p["name"],     placeholder="Jane Doe")
        p["email"]    = st.text_input("Email *",              p["email"],    placeholder="jane@example.com")
        p["phone"]    = st.text_input("Phone",                p["phone"],    placeholder="+1 (555) 123-4567")
        p["location"] = st.text_input("Location",             p["location"], placeholder="San Francisco, CA")
    with c2:
        p["title"]    = st.text_input("Professional Title *", p["title"],    placeholder="Senior Software Engineer")
        p["linkedin"] = st.text_input("LinkedIn URL",         p["linkedin"], placeholder="linkedin.com/in/janedoe")
        p["github"]   = st.text_input("GitHub URL",           p["github"],   placeholder="github.com/janedoe")
        p["website"]  = st.text_input("Website / Portfolio",  p["website"],  placeholder="janedoe.dev")

    p["summary"] = st.text_area(
        "Professional Summary",
        p["summary"],
        height=150,
        placeholder="A brief (3-5 sentence) overview of your experience, skills, and career goals.",
    )


# ── Education ────────────────────────────────────────────────────────────────
with T_EDU:
    st.header("Education")

    if st.button("➕ Add Education Entry"):
        D["education"].append({
            "degree": "", "field": "", "institution": "", "location": "",
            "start_year": "", "end_year": "", "gpa": "", "honors": "", "relevant_courses": "",
        })

    for i, edu in enumerate(D["education"]):
        label = f'{edu.get("degree") or "New Entry"} — {edu.get("institution") or "..."}'
        with st.expander(label, expanded=not edu["institution"]):
            c1, c2 = st.columns(2)
            with c1:
                edu["degree"]      = st.text_input("Degree",                  edu["degree"],      key=f"e_deg_{i}",  placeholder="Bachelor of Science")
                edu["institution"] = st.text_input("Institution",             edu["institution"], key=f"e_inst_{i}", placeholder="MIT")
                edu["start_year"]  = st.text_input("Start Year",              edu["start_year"],  key=f"e_sy_{i}",   placeholder="2018")
                edu["gpa"]         = st.text_input("GPA (optional)",          edu["gpa"],         key=f"e_gpa_{i}",  placeholder="3.9")
            with c2:
                edu["field"]       = st.text_input("Field of Study",          edu["field"],       key=f"e_fld_{i}",  placeholder="Computer Science")
                edu["location"]    = st.text_input("Location",                edu["location"],    key=f"e_loc_{i}",  placeholder="Cambridge, MA")
                edu["end_year"]    = st.text_input("End Year (or 'Present')", edu["end_year"],    key=f"e_ey_{i}",   placeholder="2022")
                edu["honors"]      = st.text_input("Honors / Awards",         edu["honors"],      key=f"e_hon_{i}",  placeholder="Magna Cum Laude")
            edu["relevant_courses"] = st.text_input(
                "Relevant Courses (comma-separated)", edu["relevant_courses"], key=f"e_rc_{i}",
                placeholder="Algorithms, Machine Learning, Systems Design",
            )
            if st.button("🗑 Remove this entry", key=f"e_del_{i}"):
                D["education"].pop(i)
                st.rerun()


# ── Experience ───────────────────────────────────────────────────────────────
with T_EXP:
    st.header("Work Experience")

    if st.button("➕ Add Experience Entry"):
        D["experience"].append({
            "company": "", "position": "", "location": "",
            "start_date": "", "end_date": "", "current": False,
            "description": "", "achievements": "",
        })

    for i, exp in enumerate(D["experience"]):
        label = f'{exp.get("position") or "New Position"} @ {exp.get("company") or "..."}'
        with st.expander(label, expanded=not exp["company"]):
            c1, c2 = st.columns(2)
            with c1:
                exp["position"]   = st.text_input("Job Title",  exp["position"],   key=f"x_pos_{i}", placeholder="Software Engineer")
                exp["company"]    = st.text_input("Company",    exp["company"],    key=f"x_co_{i}",  placeholder="Acme Corp")
                exp["start_date"] = st.text_input("Start Date", exp["start_date"], key=f"x_sd_{i}",  placeholder="Jan 2022")
            with c2:
                exp["location"] = st.text_input("Location", exp["location"], key=f"x_loc_{i}", placeholder="San Francisco, CA")
                exp["current"]  = st.checkbox("I currently work here", exp["current"], key=f"x_cur_{i}")
                if exp["current"]:
                    exp["end_date"] = "Present"
                else:
                    cur_end = exp["end_date"] if exp["end_date"] != "Present" else ""
                    exp["end_date"] = st.text_input("End Date", cur_end, key=f"x_ed_{i}", placeholder="Dec 2023")
            exp["description"] = st.text_area(
                "Role Description", exp["description"], key=f"x_desc_{i}", height=85,
                placeholder="Brief overview of your role and responsibilities.",
            )
            exp["achievements"] = st.text_area(
                "Key Achievements (one per line — these become bullet points)",
                exp["achievements"], key=f"x_ach_{i}", height=100,
                placeholder="Reduced API latency by 40%\nLed migration to microservices",
            )
            _ach_an = analyze_achievements_block(exp["achievements"])
            if _ach_an:
                st.markdown(
                    "<div style='margin:-6px 0 8px'>"
                    + "".join(
                        f"<div style='font-size:12px;color:#94a3b8;margin:3px 0'>"
                        f"<span style='opacity:.6;font-family:JetBrains Mono,monospace'>L{idx+1}</span> "
                        f"{render_strength_chip(a)}</div>"
                        for idx, a in enumerate(_ach_an)
                    )
                    + "</div>",
                    unsafe_allow_html=True,
                )
            if st.button("🗑 Remove this entry", key=f"x_del_{i}"):
                D["experience"].pop(i)
                st.rerun()


# ── Skills ───────────────────────────────────────────────────────────────────
with T_SKILLS:
    st.header("Skills")
    st.caption("Organize skills into categories, e.g. Languages, Frameworks, Tools, Soft Skills.")

    if st.button("➕ Add Skill Category"):
        D["skills"]["categories"].append({"name": "", "items": ""})

    for i, cat in enumerate(D["skills"]["categories"]):
        c1, c2, c3 = st.columns([2, 5, 1])
        with c1:
            cat["name"]  = st.text_input("Category", cat["name"],  key=f"sk_n_{i}", placeholder="Languages",              label_visibility="collapsed")
        with c2:
            cat["items"] = st.text_input("Skills",   cat["items"], key=f"sk_i_{i}", placeholder="Python, TypeScript, Go", label_visibility="collapsed")
        with c3:
            if st.button("🗑", key=f"sk_d_{i}", help="Remove category"):
                D["skills"]["categories"].pop(i)
                st.rerun()


# ── Projects ─────────────────────────────────────────────────────────────────
with T_PROJ:
    st.header("Projects")

    if st.button("➕ Add Project"):
        D["projects"].append({
            "name": "", "description": "", "tech": "",
            "github_url": "", "live_url": "", "highlights": "",
        })

    for i, proj in enumerate(D["projects"]):
        with st.expander(proj.get("name") or f"Project {i + 1}", expanded=not proj["name"]):
            c1, c2 = st.columns(2)
            with c1:
                proj["name"]       = st.text_input("Project Name",        proj["name"],       key=f"p_n_{i}",  placeholder="Awesome API")
                proj["tech"]       = st.text_input("Technologies Used",   proj["tech"],       key=f"p_t_{i}",  placeholder="Python, FastAPI, PostgreSQL")
            with c2:
                proj["github_url"] = st.text_input("GitHub URL",          proj["github_url"], key=f"p_gh_{i}", placeholder="github.com/you/project")
                proj["live_url"]   = st.text_input("Live Demo URL",       proj["live_url"],   key=f"p_lv_{i}", placeholder="project.vercel.app")
            proj["description"] = st.text_area(
                "Description", proj["description"], key=f"p_d_{i}", height=75,
                placeholder="What does this project do and why did you build it?",
            )
            proj["highlights"] = st.text_area(
                "Key Highlights (one per line)", proj["highlights"], key=f"p_h_{i}", height=75,
                placeholder="10k+ GitHub stars\nFeatured on Hacker News front page",
            )
            _hi_an = analyze_achievements_block(proj["highlights"])
            if _hi_an:
                st.markdown(
                    "<div style='margin:-6px 0 8px'>"
                    + "".join(
                        f"<div style='font-size:12px;color:#94a3b8;margin:3px 0'>"
                        f"<span style='opacity:.6;font-family:JetBrains Mono,monospace'>L{idx+1}</span> "
                        f"{render_strength_chip(a)}</div>"
                        for idx, a in enumerate(_hi_an)
                    )
                    + "</div>",
                    unsafe_allow_html=True,
                )
            if st.button("🗑 Remove this project", key=f"p_del_{i}"):
                D["projects"].pop(i)
                st.rerun()


# ── Certifications ───────────────────────────────────────────────────────────
with T_CERTS:
    st.header("Certifications & Awards")

    if st.button("➕ Add Certification"):
        D["certifications"].append({"name": "", "issuer": "", "date": "", "url": ""})

    for i, cert in enumerate(D["certifications"]):
        c1, c2, c3, c4, c5 = st.columns([3, 2, 1, 2, 0.6])
        with c1:
            cert["name"]   = st.text_input("Certification Name",   cert["name"],   key=f"c_n_{i}",   placeholder="AWS Certified Developer")
        with c2:
            cert["issuer"] = st.text_input("Issuing Org",          cert["issuer"], key=f"c_iss_{i}", placeholder="Amazon Web Services")
        with c3:
            cert["date"]   = st.text_input("Date",                 cert["date"],   key=f"c_d_{i}",   placeholder="2024")
        with c4:
            cert["url"]    = st.text_input("Credential URL",       cert["url"],    key=f"c_u_{i}",   placeholder="credly.com/...")
        with c5:
            st.write("")
            st.write("")
            if st.button("🗑", key=f"c_del_{i}", help="Remove"):
                D["certifications"].pop(i)
                st.rerun()


# ── JD Match ─────────────────────────────────────────────────────────────────
with T_MATCH:
    st.header("Job Description Match")
    st.caption(
        "Paste a job description below. The matcher pulls the most signal-rich "
        "keywords (single words and phrases), then checks which ones already "
        "appear in your bullets, summary, skills, and projects. Missing chips "
        "are the top gaps to close before applying."
    )

    if "jd_text" not in st.session_state:
        st.session_state.jd_text = ""

    jdc1, jdc2 = st.columns([3, 2])

    with jdc1:
        jd_input = st.text_area(
            "Paste job description",
            value=st.session_state.jd_text,
            key="jd_text_area",
            height=320,
            placeholder=(
                "We're looking for a Senior Software Engineer to lead our "
                "platform team. You'll architect distributed systems on "
                "Kubernetes, mentor engineers, and drive observability "
                "improvements across the stack..."
            ),
        )
        st.session_state.jd_text = jd_input

    with jdc2:
        if (jd_input or "").strip():
            res = match_resume(D, jd_input)
            score = res["score"]
            color = "#10b981" if score >= 70 else "#f59e0b" if score >= 45 else "#ef4444"
            label = "Strong match" if score >= 70 else "Partial match" if score >= 45 else "Light match"

            st.markdown(
                f"""
                <div style="
                    padding:18px 20px;
                    border-radius:12px;
                    border:1px solid rgba(148,163,184,.20);
                    background:linear-gradient(135deg,
                        rgba(34,211,238,.04) 0%,
                        rgba(167,139,250,.04) 100%);
                ">
                    <div style="
                        font-family:'JetBrains Mono',ui-monospace,monospace;
                        font-size:11px;
                        color:#94a3b8;
                        letter-spacing:.12em;
                        text-transform:uppercase;
                        margin-bottom:6px;
                    ">// JD Match Score</div>
                    <div style="
                        font-family:'Space Grotesk','Inter',sans-serif;
                        font-size:2.6rem;
                        font-weight:700;
                        color:{color};
                        line-height:1;
                        letter-spacing:-.02em;
                    ">{score}<span style="
                        font-size:1.0rem;
                        color:#94a3b8;
                        font-weight:500;
                        margin-left:2px;
                    ">/100</span></div>
                    <div style="
                        font-size:.85rem;
                        color:{color};
                        margin-top:4px;
                        font-weight:500;
                    ">{label}</div>
                    <div style="
                        font-size:.78rem;
                        color:#94a3b8;
                        margin-top:8px;
                        line-height:1.5;
                    ">Matched <strong style="color:#e8eaf0">{res['matched_kw']}</strong>
                    of <strong style="color:#e8eaf0">{res['total_kw']}</strong> keywords</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                """
                <div style="
                    padding:24px 20px;
                    border-radius:12px;
                    border:1px dashed rgba(148,163,184,.25);
                    background:rgba(255,255,255,.02);
                    text-align:center;
                ">
                    <div style="font-size:1.6rem;margin-bottom:6px">🎯</div>
                    <div style="
                        color:#94a3b8;
                        font-size:.86rem;
                        line-height:1.55;
                    ">Paste a job description to see your match score and the keywords your resume is missing.</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    if (jd_input or "").strip():
        st.markdown("---")

        res_full = match_resume(D, jd_input, top_missing=12)

        st.markdown(
            f"<div style='font-family:Inter,sans-serif;font-size:.95rem;font-weight:600;"
            f"color:#10b981;margin-bottom:6px'>"
            f"✓ Matched in your resume "
            f"<span style='color:#94a3b8;font-weight:400;font-size:.82rem'>"
            f"({len(res_full['matched'])})</span></div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            f"<div style='line-height:2.0'>{render_chip_row(res_full['matched'][:30], 'ok')}</div>",
            unsafe_allow_html=True,
        )

        st.markdown("<div style='height:14px'></div>", unsafe_allow_html=True)

        st.markdown(
            f"<div style='font-family:Inter,sans-serif;font-size:.95rem;font-weight:600;"
            f"color:#f59e0b;margin-bottom:6px'>"
            f"○ Top gaps to address "
            f"<span style='color:#94a3b8;font-weight:400;font-size:.82rem'>"
            f"({len(res_full['missing'])})</span></div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            f"<div style='line-height:2.0'>{render_chip_row(res_full['missing'], 'miss')}</div>",
            unsafe_allow_html=True,
        )

        with st.expander("How is this calculated?"):
            st.markdown(
                "- The matcher tokenizes the JD, drops stopwords + filler "
                "(\"team\", \"experience\", \"role\", etc.), and ranks the "
                "remaining single words and 2-word phrases by frequency.\n"
                "- Phrases get a 1.6x weight bonus because they carry more "
                "signal than single words.\n"
                "- Your resume corpus is everything an ATS would scan: "
                "bullets, summary, skills, project highlights, position "
                "titles, certifications.\n"
                "- The score is the percentage of weighted keywords present "
                "in the corpus. 70+ is a strong match, 45-69 is partial, "
                "below 45 means the resume needs work for this posting."
            )


# ── Preview & Export ─────────────────────────────────────────────────────────
with T_PREVIEW:
    st.header("Preview & Export")

    html_out = generate_html(D, template, accent)
    pdf_out  = generate_pdf(D)

    c1, c2, c3, _ = st.columns([1, 1, 1, 3])
    with c1:
        st.download_button("⬇ HTML", html_out, "resume.html", "text/html",         use_container_width=True)
    with c2:
        st.download_button("⬇ PDF",  pdf_out,  "resume.pdf",  "application/pdf",   use_container_width=True)
    with c3:
        st.download_button("⬇ JSON", json.dumps(D, indent=2), "resume.json", "application/json", use_container_width=True)

    st.markdown("---")
    if _dark:
        st.markdown('<div style="border-radius:8px;overflow:hidden;border:1px solid #2d3748">', unsafe_allow_html=True)
    components.html(html_out, height=900, scrolling=True)
    if _dark:
        st.markdown('</div>', unsafe_allow_html=True)

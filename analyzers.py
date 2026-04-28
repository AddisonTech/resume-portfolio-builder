"""
Resume content analyzers — bullet strength, resume health score, ATS keyword match.

Pure-Python, no external deps. Imported by app.py.
"""

import re
from collections import Counter


# ─────────────────────────────────────────────────────────────────────────────
# Strong action verbs (lowercase, deduplicated)
# ─────────────────────────────────────────────────────────────────────────────

ACTION_VERBS: frozenset = frozenset({
    "built", "led", "shipped", "reduced", "designed", "developed", "architected",
    "deployed", "scaled", "optimized", "automated", "owned", "drove", "launched",
    "delivered", "mentored", "partnered", "pioneered", "accelerated", "increased",
    "decreased", "generated", "saved", "eliminated", "streamlined", "refactored",
    "migrated", "integrated", "established", "implemented", "created", "founded",
    "headed", "managed", "directed", "oversaw", "coordinated", "executed",
    "achieved", "exceeded", "surpassed", "awarded", "recognized", "presented",
    "published", "taught", "trained", "coached", "supervised", "organized",
    "planned", "prioritized", "resolved", "solved", "identified", "analyzed",
    "researched", "evaluated", "assessed", "audited", "tested", "validated",
    "verified", "debugged", "diagnosed", "fixed", "repaired", "configured",
    "installed", "maintained", "monitored", "troubleshot", "calibrated",
    "commissioned", "programmed", "coded", "engineered", "modeled", "simulated",
    "prototyped", "fabricated", "assembled", "manufactured", "produced",
    "supplied", "sourced", "negotiated", "contracted", "sold", "marketed",
    "promoted", "advertised", "branded", "drafted", "sketched", "illustrated",
    "animated", "edited", "composed", "wrote", "authored", "reviewed",
    "approved", "certified", "qualified", "accredited", "licensed", "chaired",
    "spearheaded", "championed", "advocated", "influenced", "persuaded",
    "convinced", "secured", "won", "captured", "acquired", "recovered",
    "rescued", "rebuilt", "restructured", "transformed", "modernized",
    "revamped",
})


NUMBER_RE = re.compile(
    r"\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|"
    r"hundred|thousand|million|billion)\b",
    re.I,
)


# ─────────────────────────────────────────────────────────────────────────────
# Bullet strength
# ─────────────────────────────────────────────────────────────────────────────

def analyze_bullet(line: str) -> dict:
    """Score a single resume bullet on three criteria."""
    line = (line or "").strip()
    length = len(line)

    # First word — strip punctuation
    first_word = ""
    for tok in re.split(r"\s+", line, maxsplit=1):
        if tok:
            first_word = re.sub(r"[^A-Za-z']", "", tok).lower()
            break

    has_number = bool(NUMBER_RE.search(line))
    has_action_verb = first_word in ACTION_VERBS
    length_ok = 30 <= length <= 200

    score = sum([has_number, has_action_verb, length_ok])

    return {
        "has_number": has_number,
        "has_action_verb": has_action_verb,
        "length_ok": length_ok,
        "length": length,
        "first_word": first_word,
        "score": score,
    }


def analyze_achievements_block(text: str) -> list:
    """Run analyze_bullet on each non-empty line; preserve original line text."""
    out = []
    for line in (text or "").split("\n"):
        s = line.strip()
        if not s:
            continue
        a = analyze_bullet(s)
        a["text"] = s
        out.append(a)
    return out


def render_strength_chip(analysis: dict) -> str:
    """Compact inline-styled HTML chip showing the three criteria for one bullet."""
    def glyph(ok: bool, warn: bool = False) -> tuple:
        if ok:
            return ("✓", "#10b981")  # check, green
        if warn:
            return ("⚠", "#f59e0b")  # warn, amber
        return ("✗", "#ef4444")      # x, red

    n_g, n_c = glyph(analysis["has_number"])
    v_g, v_c = glyph(analysis["has_action_verb"])
    # length: ok = green, slightly off = amber, way off = red
    L = analysis["length"]
    if 30 <= L <= 200:
        l_g, l_c = "✓", "#10b981"
    elif 20 <= L <= 240:
        l_g, l_c = "⚠", "#f59e0b"
    else:
        l_g, l_c = "✗", "#ef4444"

    base = (
        "display:inline-flex;align-items:center;gap:4px;"
        "font-family:'JetBrains Mono',ui-monospace,monospace;"
        "font-size:11px;padding:2px 7px;border-radius:10px;"
        "border:1px solid rgba(148,163,184,.25);margin:2px 6px 2px 0;"
        "background:rgba(15,23,42,.35);"
    )
    return (
        f'<span style="{base}">'
        f'<span style="color:{n_c}">{n_g}</span>'
        f'<span style="color:#94a3b8">number</span>'
        f'<span style="color:#475569">|</span>'
        f'<span style="color:{v_c}">{v_g}</span>'
        f'<span style="color:#94a3b8">verb</span>'
        f'<span style="color:#475569">|</span>'
        f'<span style="color:{l_c}">{l_g}</span>'
        f'<span style="color:#94a3b8">{L} chars</span>'
        f'</span>'
    )


# ─────────────────────────────────────────────────────────────────────────────
# Resume health score
# ─────────────────────────────────────────────────────────────────────────────

def _all_bullets(data: dict) -> list:
    out = []
    for exp in data.get("experience", []) or []:
        out.extend(analyze_achievements_block(exp.get("achievements", "")))
    for proj in data.get("projects", []) or []:
        out.extend(analyze_achievements_block(proj.get("highlights", "")))
    return out


def score_resume_health(data: dict) -> dict:
    """Score the overall resume out of 100 across 8 buckets."""
    p = data.get("personal", {}) or {}
    breakdown = []

    # 1. Personal completeness (15)
    personal_fields = [p.get("name"), p.get("email"), p.get("title"), p.get("summary")]
    filled = sum(1 for x in personal_fields if (x or "").strip())
    pts1 = round(15 * filled / 4)
    breakdown.append({
        "label": "Personal completeness",
        "pts": pts1, "max": 15,
        "note": f"{filled}/4 of name, email, title, summary",
    })

    # 2. Summary quality (10)
    s = (p.get("summary") or "").strip()
    if 200 <= len(s) <= 600:
        pts2 = 10
        note2 = f"{len(s)} chars (sweet spot)"
    elif 100 <= len(s) < 200 or 600 < len(s) <= 800:
        pts2 = 6
        note2 = f"{len(s)} chars (close to sweet spot 200-600)"
    elif s:
        pts2 = 3
        note2 = f"{len(s)} chars (target 200-600)"
    else:
        pts2 = 0
        note2 = "empty"
    breakdown.append({"label": "Summary quality", "pts": pts2, "max": 10, "note": note2})

    # 3. Experience present (10)
    exps = [e for e in (data.get("experience") or [])
            if (e.get("company") or "").strip() and (e.get("position") or "").strip()]
    pts3 = 10 if exps else 0
    breakdown.append({
        "label": "Experience present",
        "pts": pts3, "max": 10,
        "note": f"{len(exps)} entry/entries",
    })

    # Bullets
    bullets = _all_bullets(data)
    nb = len(bullets)

    # 4. Achievements quantified (25)
    if nb:
        frac = sum(1 for b in bullets if b["has_number"]) / nb
        pts4 = round(25 * frac)
        note4 = f"{int(frac*100)}% of {nb} bullets contain numbers"
    else:
        pts4, note4 = 0, "no bullets"
    breakdown.append({"label": "Achievements quantified", "pts": pts4, "max": 25, "note": note4})

    # 5. Achievements use action verbs (15)
    if nb:
        frac = sum(1 for b in bullets if b["has_action_verb"]) / nb
        pts5 = round(15 * frac)
        note5 = f"{int(frac*100)}% start with a strong verb"
    else:
        pts5, note5 = 0, "no bullets"
    breakdown.append({"label": "Action verbs", "pts": pts5, "max": 15, "note": note5})

    # 6. Skills depth (10)
    cats = [c for c in ((data.get("skills") or {}).get("categories") or [])
            if (c.get("name") or c.get("items"))]
    distinct_items = set()
    for c in cats:
        for item in re.split(r"[,/;|]", c.get("items") or ""):
            it = item.strip().lower()
            if it:
                distinct_items.add(it)
    if len(cats) >= 3 or len(distinct_items) >= 10:
        pts6 = 10
    elif len(cats) >= 2 or len(distinct_items) >= 5:
        pts6 = 6
    elif cats:
        pts6 = 3
    else:
        pts6 = 0
    breakdown.append({
        "label": "Skills depth",
        "pts": pts6, "max": 10,
        "note": f"{len(cats)} categories, {len(distinct_items)} distinct items",
    })

    # 7. Projects/Certs (10)
    n_proj = len([x for x in (data.get("projects") or []) if (x.get("name") or "").strip()])
    n_cert = len([x for x in (data.get("certifications") or []) if (x.get("name") or "").strip()])
    if n_proj >= 1 or n_cert >= 2:
        pts7 = 10
    elif n_cert >= 1:
        pts7 = 5
    else:
        pts7 = 0
    breakdown.append({
        "label": "Projects / Certs",
        "pts": pts7, "max": 10,
        "note": f"{n_proj} project(s), {n_cert} cert(s)",
    })

    # 8. Bullet length sanity (5)
    if nb:
        frac = sum(1 for b in bullets if b["length"] <= 200) / nb
        pts8 = round(5 * frac)
        note8 = f"{int(frac*100)}% of bullets <= 200 chars"
    else:
        pts8, note8 = 0, "no bullets"
    breakdown.append({"label": "Bullet length", "pts": pts8, "max": 5, "note": note8})

    total = sum(b["pts"] for b in breakdown)
    return {"score": total, "breakdown": breakdown}

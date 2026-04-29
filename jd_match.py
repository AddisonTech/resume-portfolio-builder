"""
Job description / ATS keyword match for the resume builder.

Pure-Python, no external deps. The matcher extracts the keywords that matter
most in a job description (single words and bigrams), then checks which of
those keywords appear anywhere in the resume corpus — bullets, summary,
skills, project highlights, position titles. Returns a match percentage,
matched keywords, and the top missing keywords so the user knows which gaps
to close before applying.
"""

from __future__ import annotations

import re
from collections import Counter


# ─────────────────────────────────────────────────────────────────────────────
# Stopwords - common English + resume/job-posting fluff that adds no signal
# ─────────────────────────────────────────────────────────────────────────────

_STOPWORDS: frozenset = frozenset({
    # articles, conjunctions, prepositions
    "a","an","the","and","or","but","if","of","at","by","for","with","about",
    "against","between","into","through","during","before","after","above",
    "below","from","up","down","in","out","on","off","over","under","again",
    "further","then","once","to","is","am","are","was","were","be","been",
    "being","have","has","had","do","does","did","doing","will","would","can",
    "could","should","shall","may","might","must","this","that","these",
    "those","i","me","my","we","us","our","you","your","they","them","their",
    "he","she","it","its","not","no","nor","so","than","too","very","just",
    "as","all","any","both","each","few","more","most","other","some","such",
    "only","own","same","also","because","while",
    # job-posting filler that's everywhere
    "ability","able","across","applicant","apply","based","candidate",
    "candidates","company","companys","day","days","equal","employer",
    "etc","experience","experiences","good","great","help","including",
    "industry","job","jobs","know","knowledge","learn","learning","like",
    "looking","make","new","one","opportunity","plus","preferred","required",
    "requirement","requirements","responsibilities","responsibility","role",
    "skills","strong","team","teams","time","track","understanding","using",
    "various","want","ways","week","weeks","work","working","year","years",
    "you'll","youll","we're","were","we'll","well","you'll","ours","yours",
    "able","ability","environment","position","please","plus","prefer",
    "preferred","include","includes","including","across","along","every",
    "currently","ideal","minimum","maximum","required","preferred","level",
    "levels","strong","clear","effective","passion","passionate","mindset",
    "self","driven","fast","paced","environment","culture",
})

# Tokens shorter than this are usually noise
_MIN_TOKEN_LEN = 2

# Tech-y patterns that should always survive even if short
_KEEP_PATTERNS = (
    re.compile(r"^[a-z]\+\+?$"),     # c, c++
    re.compile(r"^[a-z]#$"),         # c#
    re.compile(r"^\d+[a-z]+$"),       # 3d, 2d
)

_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9\+\#\.\-/]*")


# ─────────────────────────────────────────────────────────────────────────────
# Tokenization
# ─────────────────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Lowercase tokens preserving tech symbols (+, #, ., -, /)."""
    out = []
    for m in _TOKEN_RE.finditer(text or ""):
        tok = m.group(0).lower().strip(".-/")
        if not tok:
            continue
        if tok in _STOPWORDS:
            continue
        if len(tok) < _MIN_TOKEN_LEN and not any(p.match(tok) for p in _KEEP_PATTERNS):
            continue
        out.append(tok)
    return out


def _bigrams(tokens: list[str]) -> list[str]:
    """Generate adjacent two-word phrases (machine learning, project management)."""
    return [f"{a} {b}" for a, b in zip(tokens, tokens[1:])]


# ─────────────────────────────────────────────────────────────────────────────
# Keyword extraction from a job description
# ─────────────────────────────────────────────────────────────────────────────

def extract_jd_keywords(jd_text: str, max_unigrams: int = 30, max_bigrams: int = 12) -> list[dict]:
    """
    Pull the most signal-rich keywords from a job description.
    Returns a list of dicts: { term, count, kind, weight }
    Sorted by weight, descending.
    """
    text = (jd_text or "").strip()
    if not text:
        return []

    toks = _tokenize(text)
    uni = Counter(toks)
    bi  = Counter(_bigrams(toks))

    # Strip bigrams whose constituent unigrams are dominant on their own.
    # If both halves of a bigram already appear N times alone, the bigram is
    # often noise like "data data" or repeated phrases.
    bi = Counter({
        phrase: c for phrase, c in bi.items()
        if c >= 2 and len(phrase.split()) == 2
    })

    out: list[dict] = []
    for term, count in uni.most_common(max_unigrams):
        out.append({
            "term": term,
            "count": count,
            "kind": "word",
            # Weight gives a slight bonus to terms that appear repeatedly
            "weight": count * (1 + 0.15 * (len(term) >= 5)),
        })
    for term, count in bi.most_common(max_bigrams):
        # Bigrams get a boost - phrases carry more signal than single words
        out.append({
            "term": term,
            "count": count,
            "kind": "phrase",
            "weight": count * 1.6,
        })

    # If a bigram contains a unigram already in the list, drop the unigram
    # to avoid double-counting the same skill.
    bigram_words: set = set()
    for kw in out:
        if kw["kind"] == "phrase":
            bigram_words.update(kw["term"].split())
    out = [
        kw for kw in out
        if kw["kind"] == "phrase" or kw["term"] not in bigram_words
    ]

    out.sort(key=lambda k: k["weight"], reverse=True)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Build a resume "corpus" - everything an ATS would see
# ─────────────────────────────────────────────────────────────────────────────

def build_resume_corpus(data: dict) -> str:
    """Flatten the resume into a single searchable text blob."""
    parts: list[str] = []
    p = data.get("personal", {}) or {}

    parts.append(p.get("title", ""))
    parts.append(p.get("summary", ""))

    for exp in data.get("experience", []) or []:
        parts.append(exp.get("position", ""))
        parts.append(exp.get("company", ""))
        parts.append(exp.get("description", ""))
        parts.append(exp.get("achievements", ""))

    for cat in (data.get("skills", {}) or {}).get("categories", []) or []:
        parts.append(cat.get("name", ""))
        parts.append(cat.get("items", ""))

    for proj in data.get("projects", []) or []:
        parts.append(proj.get("name", ""))
        parts.append(proj.get("description", ""))
        parts.append(proj.get("highlights", ""))
        parts.append(proj.get("tech", ""))

    for cert in data.get("certifications", []) or []:
        parts.append(cert.get("name", ""))
        parts.append(cert.get("issuer", ""))

    return "\n".join(p for p in parts if p)


# ─────────────────────────────────────────────────────────────────────────────
# Match keywords against the resume
# ─────────────────────────────────────────────────────────────────────────────

def _term_present(term: str, corpus_lower: str) -> bool:
    """Check if a term appears as a whole word/phrase in the corpus."""
    # Use a regex with word boundaries that also tolerates +/#/. inside terms
    safe = re.escape(term)
    pattern = rf"(?<![a-z0-9]){safe}(?![a-z0-9])"
    return bool(re.search(pattern, corpus_lower))


def match_resume(data: dict, jd_text: str, top_missing: int = 8) -> dict:
    """
    Return a match breakdown:
      score        - 0-100 overall match
      matched      - list of {term, kind, count} present in resume
      missing      - top N important keywords NOT in the resume
      total_kw     - total number of JD keywords considered
      matched_kw   - count of matched keywords
      jd_excerpt   - first 200 chars of the JD (for display)
    """
    keywords = extract_jd_keywords(jd_text)
    if not keywords:
        return {
            "score": 0,
            "matched": [],
            "missing": [],
            "total_kw": 0,
            "matched_kw": 0,
            "jd_excerpt": "",
        }

    corpus = build_resume_corpus(data).lower()

    matched: list[dict] = []
    missing: list[dict] = []
    total_weight = 0.0
    matched_weight = 0.0

    for kw in keywords:
        total_weight += kw["weight"]
        if _term_present(kw["term"], corpus):
            matched.append(kw)
            matched_weight += kw["weight"]
        else:
            missing.append(kw)

    score = round(100 * matched_weight / total_weight) if total_weight else 0

    return {
        "score": max(0, min(100, score)),
        "matched": matched,
        "missing": missing[:top_missing],
        "total_kw": len(keywords),
        "matched_kw": len(matched),
        "jd_excerpt": (jd_text or "").strip()[:200],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Render helpers (HTML chips for the Streamlit UI)
# ─────────────────────────────────────────────────────────────────────────────

def render_chip(term: str, kind: str, tone: str) -> str:
    """One inline chip in matched/missing lists."""
    base = (
        "display:inline-flex;align-items:center;gap:5px;"
        "font-family:'JetBrains Mono',ui-monospace,monospace;"
        "font-size:11.5px;padding:3px 9px;border-radius:100px;"
        "margin:3px 5px 3px 0;"
    )
    palette = {
        "ok":   ("#10b981", "rgba(16, 185, 129, .32)", "rgba(16, 185, 129, .08)"),
        "miss": ("#f59e0b", "rgba(245, 158, 11, .32)", "rgba(245, 158, 11, .08)"),
    }[tone]
    color, border, bg = palette
    glyph = "✓" if tone == "ok" else "○"
    label = "phrase" if kind == "phrase" else "word"
    return (
        f'<span style="{base}'
        f'color:{color};border:1px solid {border};background:{bg};">'
        f'<span>{glyph}</span><span>{term}</span>'
        f'<span style="opacity:.55;font-size:9.5px">[{label}]</span>'
        f'</span>'
    )


def render_chip_row(items: list[dict], tone: str) -> str:
    if not items:
        return '<span style="color:#94a3b8;font-style:italic">none</span>'
    return "".join(render_chip(k["term"], k["kind"], tone) for k in items)

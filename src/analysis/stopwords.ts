// English stopwords + resume/job-posting filler. Ported verbatim from
// jd_match.py _STOPWORDS — order doesn't matter, dedup by Set.

export const STOPWORDS: ReadonlySet<string> = new Set<string>([
  // articles, conjunctions, prepositions
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'to', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'doing', 'will', 'would', 'can',
  'could', 'should', 'shall', 'may', 'might', 'must', 'this', 'that', 'these',
  'those', 'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'they', 'them', 'their',
  'he', 'she', 'it', 'its', 'not', 'no', 'nor', 'so', 'than', 'too', 'very', 'just',
  'as', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'also', 'because', 'while',
  // job-posting filler
  'ability', 'able', 'across', 'applicant', 'apply', 'based', 'candidate',
  'candidates', 'company', 'companys', 'day', 'days', 'equal', 'employer',
  'etc', 'experience', 'experiences', 'good', 'great', 'help', 'including',
  'industry', 'job', 'jobs', 'know', 'knowledge', 'learn', 'learning', 'like',
  'looking', 'make', 'new', 'one', 'opportunity', 'plus', 'preferred', 'required',
  'requirement', 'requirements', 'responsibilities', 'responsibility', 'role',
  'skills', 'strong', 'team', 'teams', 'time', 'track', 'understanding', 'using',
  'various', 'want', 'ways', 'week', 'weeks', 'work', 'working', 'year', 'years',
  "you'll", 'youll', "we're", 'were', "we'll", 'well', 'ours', 'yours',
  'environment', 'position', 'please', 'prefer',
  'include', 'includes', 'along', 'every',
  'currently', 'ideal', 'minimum', 'maximum', 'level',
  'levels', 'clear', 'effective', 'passion', 'passionate', 'mindset',
  'self', 'driven', 'fast', 'paced', 'culture',
]);

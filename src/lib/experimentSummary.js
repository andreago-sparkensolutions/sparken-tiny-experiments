/**
 * Collapse whitespace and newlines to a single line.
 * @param {string} s
 */
function normalizeOneLine(s) {
  return String(s).trim().replace(/\s+/g, ' ')
}

/**
 * First non-empty source text for snapshot blurbs (question reads best as “what this is”).
 * @param {{ experiment_description?: string | null, hypothesis?: string | null, question?: string | null, observation?: string | null, category?: string | null } | null | undefined} exp
 */
function snapshotSourceRaw(exp) {
  if (!exp) return ''
  const candidates = [exp.question, exp.observation, exp.hypothesis, exp.experiment_description]
  for (const c of candidates) {
    const t = normalizeOneLine(c == null ? '' : String(c))
    if (t) return t
  }
  return normalizeOneLine(exp.category ?? '')
}

/**
 * Full source line for tooltips / accessibility (same text as the card blurb; not truncated).
 * @param {{ experiment_description?: string | null, hypothesis?: string | null, question?: string | null, observation?: string | null, category?: string | null } | null | undefined} exp
 */
export function experimentSnapshotSummaryFull(exp) {
  return snapshotSourceRaw(exp)
}

/**
 * Snapshot card blurb: question / observation / hypothesis / description (full text, wrapped in UI).
 * @param {{ experiment_description?: string | null, hypothesis?: string | null, question?: string | null, observation?: string | null, category?: string | null } | null | undefined} exp
 */
export function experimentSnapshotSummary(exp) {
  return snapshotSourceRaw(exp)
}

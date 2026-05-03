/** Max characters for snapshot one-liners (pulse cards + goal chart rows). */
const SNAPSHOT_ONE_LINE_MAX = 96

/**
 * Collapse whitespace and newlines to a single line.
 * @param {string} s
 */
function normalizeOneLine(s) {
  return String(s).trim().replace(/\s+/g, ' ')
}

/**
 * Truncate at word boundary when possible; append ellipsis when cut.
 * @param {string} text
 * @param {number} maxLen
 */
function truncateOneLine(text, maxLen) {
  const t = normalizeOneLine(text)
  if (!t) return ''
  if (t.length <= maxLen) return t
  const slice = t.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > Math.floor(maxLen * 0.55) ? slice.slice(0, lastSpace) : slice
  const out = cut.trimEnd()
  return out.length ? `${out}…` : '…'
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
 * Full source line for tooltips (before truncation).
 * @param {{ experiment_description?: string | null, hypothesis?: string | null, question?: string | null, observation?: string | null, category?: string | null } | null | undefined} exp
 */
export function experimentSnapshotSummaryFull(exp) {
  return snapshotSourceRaw(exp)
}

/**
 * Short single-line blurb for snapshot cards: question / observation / hypothesis / description, truncated.
 * @param {{ experiment_description?: string | null, hypothesis?: string | null, question?: string | null, observation?: string | null, category?: string | null } | null | undefined} exp
 */
export function experimentSnapshotSummary(exp) {
  return truncateOneLine(snapshotSourceRaw(exp), SNAPSHOT_ONE_LINE_MAX)
}

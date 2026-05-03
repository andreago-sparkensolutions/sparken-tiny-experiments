/** @param {string | Date | null | undefined} iso */
export function formatRelativeTime(iso) {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const now = Date.now()
  const diffSec = Math.max(0, Math.round((now - then) / 1000))

  if (diffSec < 45) return 'just now'
  const min = Math.floor(diffSec / 60)
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`
  const yr = Math.floor(mo / 12)
  return `${yr} year${yr === 1 ? '' : 's'} ago`
}

/** @param {{ updated_at?: string, created_at?: string }[] | undefined} experiments */
export function maxUpdatedAt(experiments) {
  if (!experiments?.length) return null
  let max = 0
  for (const e of experiments) {
    const t = new Date(e.updated_at ?? e.created_at).getTime()
    if (!Number.isNaN(t) && t > max) max = t
  }
  return max ? new Date(max).toISOString() : null
}

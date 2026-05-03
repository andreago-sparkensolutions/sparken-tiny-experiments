/**
 * End of the current program window: June 30 (local), same year if still on/before that date, else next year.
 * @param {Date} [today]
 * @returns {Date} calendar date June 30 (local midnight)
 */
export function programEndJune(today = new Date()) {
  const y = today.getFullYear()
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const june30ThisYear = new Date(y, 5, 30)
  if (t0 <= june30ThisYear) return june30ThisYear
  return new Date(y + 1, 5, 30)
}

/** @param {Date} d */
export function toDateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const longFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const mediumFmt = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/** @param {Date} d */
export function formatProgramDayLong(d) {
  return longFmt.format(d)
}

/** @param {Date} d */
export function formatProgramDayMedium(d) {
  return mediumFmt.format(d)
}

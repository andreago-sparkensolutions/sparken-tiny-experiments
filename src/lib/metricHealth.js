/** @param {{ metrics?: { status?: string }[] }[]} experiments */
export function aggregateMetricHealth(experiments) {
  let on_track = 0
  let warning = 0
  let off_track = 0
  let pending = 0

  for (const exp of experiments ?? []) {
    for (const m of exp.metrics ?? []) {
      const s = m.status || 'pending'
      if (s === 'on_track') on_track++
      else if (s === 'warning') warning++
      else if (s === 'off_track') off_track++
      else pending++
    }
  }

  const total = on_track + warning + off_track + pending
  return { on_track, warning, off_track, pending, total }
}

/** @param {ReturnType<typeof aggregateMetricHealth>} stats */
export function healthVerdict(stats) {
  const { on_track, warning, off_track, pending, total } = stats

  if (total === 0) {
    return {
      tone: 'pending',
      headline: 'No metrics yet',
      detail: 'Add metrics to experiments to see a health snapshot here.',
    }
  }

  if (off_track > 0) {
    return {
      tone: 'off_track',
      headline: 'Needs attention',
      detail: `${off_track} metric${off_track === 1 ? '' : 's'} off track. Review those rows first, then warnings.`,
    }
  }

  if (warning > 0) {
    return {
      tone: 'warning',
      headline: 'Mixed — watch closely',
      detail: `${warning} metric${warning === 1 ? '' : 's'} in warning. Nothing off track yet.`,
    }
  }

  if (pending === total) {
    return {
      tone: 'pending',
      headline: 'Collecting data',
      detail: 'All metrics are still pending. Log weekly updates to light up this scoreboard.',
    }
  }

  if (on_track === total) {
    return {
      tone: 'on_track',
      headline: 'Going well',
      detail: 'Every tracked metric is on track.',
    }
  }

  if (on_track > 0 && warning === 0 && off_track === 0) {
    return {
      tone: 'on_track',
      headline: 'Trending positive',
      detail: `${on_track} on track · ${pending} still pending data.`,
    }
  }

  return {
    tone: 'pending',
    headline: 'In progress',
    detail: `${on_track} on track · ${pending} pending · ${warning} warning · ${off_track} off track.`,
  }
}

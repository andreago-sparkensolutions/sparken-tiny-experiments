/** @param {string | null | undefined} status */
export function statusFillFraction(status) {
  const s = status || 'pending'
  if (s === 'on_track') return 1
  if (s === 'warning') return 0.55
  if (s === 'off_track') return 0.28
  return 0.12
}

/** @param {string | null | undefined} status */
export function statusBarColor(status) {
  const s = status || 'pending'
  if (s === 'on_track') return 'var(--color-yellow)'
  if (s === 'warning') return 'var(--color-lime)'
  if (s === 'off_track') return 'var(--color-danger)'
  return 'var(--color-lavender)'
}

/** @param {string | null | undefined} status */
export function statusSegmentColor(status) {
  return statusBarColor(status)
}

/**
 * Worst signal across metrics (for service-style card severity).
 * @param {{ status?: string }[] | undefined} metrics
 */
export function worstMetricSignal(metrics) {
  if (!metrics?.length) return 'pending'
  const rank = { off_track: 0, warning: 1, pending: 2, on_track: 3 }
  let worst = 'on_track'
  for (const m of metrics) {
    const s = m.status && rank[m.status] !== undefined ? m.status : 'pending'
    if (rank[s] < rank[worst]) worst = s
  }
  return worst
}

/** @param {string} signal */
export function signalBorderClass(signal) {
  const s = signal || 'pending'
  if (s === 'off_track') return 'border-l-4 border-l-[var(--color-danger)]'
  if (s === 'warning') return 'border-l-4 border-l-[var(--color-lime)]'
  if (s === 'on_track') return 'border-l-4 border-l-[var(--color-yellow)]'
  return 'border-l-4 border-l-[var(--color-lavender)]'
}

/**
 * Try to pull a number from free-text metric values (e.g. "18%", "4 calls", "$3k").
 * @param {string | null | undefined} text
 * @returns {number | null}
 */
export function parseLooseNumber(text) {
  if (text == null || String(text).trim() === '') return null
  const s = String(text).trim().replace(/,/g, '')
  const pct = s.match(/(\d+\.?\d*)\s*%/)
  if (pct) return Math.min(100, parseFloat(pct[1]))
  const money = s.match(/\$?\s*(\d+\.?\d*)\s*[kK]/)
  if (money) return parseFloat(money[1]) * 1000
  const plain = s.match(/(\d+\.?\d*)/)
  if (plain) return parseFloat(plain[1])
  return null
}

/**
 * Prefer upper bound of ranges like "3–5" or "20-50" for a target scale hint.
 * @param {string | null | undefined} text
 * @returns {number | null}
 */
export function parseTargetHint(text) {
  if (text == null || String(text).trim() === '') return null
  const s = String(text).trim().replace(/,/g, '')
  const range = s.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/)
  if (range) return Math.max(parseFloat(range[1]), parseFloat(range[2]))
  return parseLooseNumber(text)
}

/**
 * When both values parse, return 0–1 progress of current toward a soft "target" cap.
 * @param {number | null} current
 * @param {number | null} targetHint
 */
export function numericProgress(current, targetHint) {
  if (current == null || targetHint == null || targetHint <= 0) return null
  return Math.min(1, current / targetHint)
}

/**
 * 0–1 current position and 0–1 target marker on a shared row scale (for charting).
 * @param {number | null} currentNum
 * @param {number | null} targetNum
 * @returns {{ currentT: number, targetT: number, maxV: number } | null}
 */
export function normalizedGoalPositions(currentNum, targetNum) {
  if (currentNum == null || targetNum == null) return null
  const maxV = Math.max(currentNum, targetNum, 1e-9)
  return {
    currentT: Math.min(1, currentNum / maxV),
    targetT: Math.min(1, targetNum / maxV),
    maxV,
  }
}

/**
 * Layout for one horizontal bullet row: fill width vs end-of-track goal marker.
 * @param {{ target_value?: string | null, current_value?: string | null, status?: string }} m
 */
export function metricBulletLayout(m) {
  const status = m.status || 'pending'
  const targetNum = parseTargetHint(m.target_value)
  const currentNum = parseLooseNumber(m.current_value)
  const targetParses = targetNum != null && targetNum > 0
  const currentParses = currentNum != null

  let fillFraction
  if (targetParses && currentParses) {
    fillFraction = Math.min(1, currentNum / targetNum)
  } else {
    fillFraction = statusFillFraction(status)
  }

  const fillColor = statusBarColor(status)
  let rightLabel
  if (targetParses && currentParses) {
    rightLabel = `${Math.round(fillFraction * 100)}% of hypothesized target`
  } else if (targetParses && !currentParses) {
    rightLabel = 'Log current'
  } else {
    rightLabel = status.replace(/_/g, ' ')
  }

  return {
    fillFraction,
    fillColor,
    /** Solid goal line at end when we have a numeric target anchor; dashed for qualitative targets. */
    solidGoal: targetParses,
    rightLabel,
    targetParses,
    currentParses,
  }
}

/**
 * Experiment-level roll-up: mean bullet fill + worst signal + status counts.
 * @param {{ status?: string }[] | undefined} metrics
 */
/**
 * @param {number} n
 * @returns {string}
 */
export function formatRollupNumber(n) {
  if (n == null || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1000 && abs < 1e9) return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (Number.isInteger(n) || Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n))
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}

/**
 * Short line for snapshot cards when we can surface parsed numbers from target / current text.
 * @param {object} rollup — result of {@link experimentRollupFromMetrics}
 * @returns {string | null}
 */
export function snapshotHypothesizedTargetNumericBlurb(rollup) {
  if (!rollup) return null
  const { numericPairCount, avgPairedCurrent, avgPairedTarget, parsedNumericTargets } = rollup
  if (numericPairCount > 0 && avgPairedCurrent != null && avgPairedTarget != null) {
    return `Avg parsed current ${formatRollupNumber(avgPairedCurrent)} vs hypothesized target ${formatRollupNumber(
      avgPairedTarget
    )} (${numericPairCount} metric${numericPairCount === 1 ? '' : 's'})`
  }
  const targets = parsedNumericTargets ?? []
  if (!targets.length) return null
  const maxShow = 5
  const slice = targets.slice(0, maxShow)
  const suffix = targets.length > maxShow ? ' · …' : ''
  return `Parsed numeric anchors from target text: ${slice.map(formatRollupNumber).join(' · ')}${suffix}`
}

export function experimentRollupFromMetrics(metrics) {
  const arr = metrics ?? []
  if (!arr.length) {
    return {
      avgFill: 0,
      avgNumericGoalFraction: null,
      avgPairedCurrent: null,
      avgPairedTarget: null,
      numericPairCount: 0,
      parsedNumericTargets: /** @type {number[]} */ ([]),
      worst: 'pending',
      counts: { on_track: 0, warning: 0, off_track: 0, pending: 0 },
    }
  }
  const layouts = arr.map((m) => metricBulletLayout(m))
  const avgFill = layouts.reduce((s, l) => s + l.fillFraction, 0) / layouts.length

  const numericSamples = []
  const pairedCurrents = []
  const pairedTargets = []
  const parsedNumericTargets = []
  for (const m of arr) {
    const tn = parseTargetHint(m.target_value)
    const cn = parseLooseNumber(m.current_value)
    if (tn != null && tn > 0) {
      parsedNumericTargets.push(tn)
    }
    if (tn != null && tn > 0 && cn != null) {
      numericSamples.push(Math.min(1, cn / tn))
      pairedCurrents.push(cn)
      pairedTargets.push(tn)
    }
  }
  const avgNumericGoalFraction = numericSamples.length
    ? numericSamples.reduce((a, b) => a + b, 0) / numericSamples.length
    : null
  const numericPairCount = pairedCurrents.length
  const avgPairedCurrent =
    numericPairCount > 0 ? pairedCurrents.reduce((a, b) => a + b, 0) / numericPairCount : null
  const avgPairedTarget =
    numericPairCount > 0 ? pairedTargets.reduce((a, b) => a + b, 0) / numericPairCount : null

  const worst = worstMetricSignal(arr)
  const counts = { on_track: 0, warning: 0, off_track: 0, pending: 0 }
  for (const m of arr) {
    const s = m.status || 'pending'
    if (s === 'on_track') counts.on_track++
    else if (s === 'warning') counts.warning++
    else if (s === 'off_track') counts.off_track++
    else counts.pending++
  }
  return {
    avgFill,
    avgNumericGoalFraction,
    avgPairedCurrent,
    avgPairedTarget,
    numericPairCount,
    parsedNumericTargets,
    worst,
    counts,
  }
}

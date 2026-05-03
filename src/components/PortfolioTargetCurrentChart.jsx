import { Link } from 'react-router-dom'
import {
  effectiveTargetUpperBound,
  formatMetricTargetDisplay,
  parseLooseNumber,
  statusBarColor,
} from '../lib/metricVisual'

function displayNow(raw) {
  if (raw == null) return '—'
  const s = String(raw).trim()
  return s === '' ? '—' : s
}

/**
 * One row: metric label, target vs now labels, simple bar (fill = now, tick = numeric target).
 * @param {{ metric: { id: string, label?: string, status?: string, current_value?: string | null, target_value?: string | null, target_upper_bound?: number | null } }} props
 */
function MetricTargetCurrentRow({ metric }) {
  const targetNum = effectiveTargetUpperBound(metric)
  const currentNum = parseLooseNumber(metric.current_value)
  const targetLabel = formatMetricTargetDisplay(metric)
  const nowLabel = displayNow(metric.current_value)
  const bothNumeric = targetNum != null && targetNum > 0 && currentNum != null
  const maxV = bothNumeric ? Math.max(targetNum, currentNum, 1e-9) : null
  const fillPct = bothNumeric && maxV ? Math.min(100, (currentNum / maxV) * 100) : 0
  const tickPct = bothNumeric && maxV ? Math.min(100, (targetNum / maxV) * 100) : null

  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <span className="min-w-0 max-w-[55%] truncate font-body text-[11px] font-semibold text-[var(--color-black)]" title={metric.label}>
          {metric.label || 'Metric'}
        </span>
        <span className="shrink-0 font-metric text-[10px] tabular-nums text-[color-mix(in_srgb,var(--color-purple)_78%,var(--color-black))]">
          <span className="font-semibold text-[var(--color-purple)]">Target {targetLabel}</span>
          <span className="mx-1 text-[color-mix(in_srgb,var(--color-purple)_45%,transparent)]">·</span>
          <span>Now {nowLabel}</span>
        </span>
      </div>
      {bothNumeric && maxV ? (
        <div
          className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-sm bg-[color-mix(in_srgb,var(--color-lavender)_45%,white)] ring-1 ring-[color-mix(in_srgb,var(--color-purple)_10%,transparent)]"
          role="img"
          aria-label="Logged value as bar fill; purple line is numeric target."
        >
          <div
            className="absolute inset-y-0 left-0 rounded-sm"
            style={{
              width: `${fillPct}%`,
              backgroundColor: statusBarColor(metric.status),
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-black) 6%, transparent)',
            }}
          />
          {tickPct != null ? (
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-[var(--color-purple)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-white)_70%,transparent)]"
              style={{ left: `calc(${tickPct}% - 0.5px)` }}
              aria-hidden
            />
          ) : null}
        </div>
      ) : (
        <p className="m-0 mt-1 font-body text-[10px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_58%,transparent)]">
          {targetNum == null || targetNum <= 0
            ? 'Set a numeric target to see a bar.'
            : 'Log a numeric current value to line up with the target on the bar.'}
        </p>
      )}
    </div>
  )
}

/**
 * Simple portfolio view: each experiment gets a compact block of target vs logged (numeric) bars.
 * @param {{ experiments?: unknown[] }} props
 */
export default function PortfolioTargetCurrentChart({ experiments }) {
  const list = experiments ?? []
  const anyMetrics = list.some((e) => (e.metrics?.length ?? 0) > 0)

  if (!list.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_8%,var(--color-white))] p-4">
      <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Target vs logged (by experiment)</p>
      <p className="m-0 mb-4 max-w-3xl font-body text-[11px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_74%,transparent)]">
        Each row is one metric. <strong className="font-semibold text-[var(--color-black)]">Colored fill</strong> is the logged value on a scale up to the larger of target and current; the{' '}
        <strong className="font-semibold text-[var(--color-purple)]">purple tick</strong> is the numeric target. Open an experiment for full context.
      </p>

      {!anyMetrics ? (
        <p className="m-0 font-body text-[12px] text-[color-mix(in_srgb,var(--color-purple)_65%,transparent)]">No metrics yet — add metrics on each experiment to see this chart.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((exp) => {
            const metrics = exp.metrics ?? []
            return (
              <div
                key={exp.id}
                className="rounded-md border border-[color-mix(in_srgb,var(--color-purple)_22%,var(--color-lavender))] bg-[var(--color-white)] px-3 py-3 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate font-body text-[12px] font-bold uppercase tracking-wide text-[var(--color-black)]" title={exp.title}>
                    {exp.title || 'Untitled'}
                  </span>
                  <Link
                    to={`/experiment/${exp.id}`}
                    className="focus-sparken shrink-0 font-body text-[10px] font-semibold text-[var(--color-purple)] underline underline-offset-2 hover:text-[var(--color-black)]"
                  >
                    Open →
                  </Link>
                </div>
                {metrics.length ? (
                  <div className="divide-y divide-[color-mix(in_srgb,var(--color-lavender)_70%,transparent)]">
                    {metrics.map((m) => (
                      <MetricTargetCurrentRow key={m.id} metric={m} />
                    ))}
                  </div>
                ) : (
                  <p className="m-0 font-body text-[11px] italic text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">No metrics on this experiment yet.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

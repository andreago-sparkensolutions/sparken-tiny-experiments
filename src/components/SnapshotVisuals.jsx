import { Link } from 'react-router-dom'
import { InlineExperimentTargetOwnerEmail, InlineExperimentTitle } from './InlineExperimentFields'
import { MetricFullEditRow } from './MetricsTable'
import { aggregateMetricHealth } from '../lib/metricHealth'
import {
  effectiveTargetUpperBound,
  formatMetricTargetDisplay,
  numericProgress,
  parseLooseNumber,
  statusBarColor,
  statusFillFraction,
  statusSegmentColor,
} from '../lib/metricVisual'

/** Stacked bar: share of metrics by status */
export function StatusDistributionChart({ experiments }) {
  const { on_track, warning, off_track, pending, total } = aggregateMetricHealth(experiments)
  if (!total) {
    return (
      <div className="rounded border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_12%,white)] px-3 py-4 text-center font-body text-[13px] text-[color-mix(in_srgb,var(--color-purple)_70%,transparent)]">
        No metrics to chart yet.
      </div>
    )
  }

  const w = 360
  const h = 28
  const parts = [
    { key: 'on', n: on_track, fill: 'var(--color-yellow)' },
    { key: 'warn', n: warning, fill: 'var(--color-lime)' },
    { key: 'off', n: off_track, fill: 'var(--color-danger)' },
    { key: 'pend', n: pending, fill: 'var(--color-lavender)' },
  ].filter((p) => p.n > 0)

  let x = 0
  const rects = parts.map((p) => {
    const rw = (p.n / total) * w
    const r = <rect key={p.key} x={x} y={0} width={rw} height={h} fill={p.fill} rx={2} />
    x += rw
    return r
  })

  return (
    <div>
      <p className="font-sparken-label mb-2 text-[var(--color-purple)]">Metric mix (all experiments)</p>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="max-w-full rounded-sm border border-[var(--color-lavender)]" role="img" aria-label="Distribution of metric statuses">
        <title>
          {on_track} on track, {warning} warning, {off_track} off track, {pending} pending
        </title>
        {rects}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-yellow)] align-middle" /> On track {on_track}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-lime)] align-middle" /> Warning {warning}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-danger)] align-middle" /> Off track {off_track}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-lavender)] align-middle" /> Pending {pending}
        </span>
      </div>
    </div>
  )
}

/** One row per experiment: colored segments = each metric’s status (click → detail) */
export function ExperimentMetricHeatstrip({ experiments, canEdit = false, onUpdateExperiment }) {
  if (!experiments?.length) return null

  return (
    <div>
      <p className="font-sparken-label mb-3 text-[var(--color-purple)]">
        Per-experiment metrics{canEdit ? ' (title editable; metric edits on Targets & logged values)' : ' (open Targets & logged values for detail)'}
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {experiments.map((exp) => {
          const metrics = exp.metrics ?? []
          return (
            <li key={exp.id}>
              <div className="flex w-full items-center gap-3 rounded-sm border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_10%,white)] px-3 py-2 text-left transition-colors hover:border-[var(--color-purple)] hover:bg-[color-mix(in_srgb,var(--color-yellow)_12%,white)]">
                <div className="flex w-[min(40%,12rem)] shrink-0 flex-col gap-1">
                  {canEdit && onUpdateExperiment ? (
                    <>
                      <InlineExperimentTitle experiment={exp} onUpdateExperiment={onUpdateExperiment} className="text-[11px]" />
                      <InlineExperimentTargetOwnerEmail
                        experiment={exp}
                        onUpdateExperiment={onUpdateExperiment}
                        className="text-[11px] font-normal normal-case"
                      />
                    </>
                  ) : (
                    <>
                      <span className="truncate font-body text-[12px] font-semibold text-[var(--color-black)]">
                        {exp.emoji ? `${exp.emoji} ` : ''}
                        {exp.title}
                      </span>
                      <span className="truncate font-body text-[10px] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]" title="Program target owner (email)">
                        {exp.target_owner_email?.trim() ? (
                          <>
                            <span className="font-metric font-bold uppercase tracking-wide">Program owner</span>{' '}
                            <span className="break-all">{exp.target_owner_email.trim()}</span>
                          </>
                        ) : (
                          <span className="italic">No program target owner set</span>
                        )}
                      </span>
                    </>
                  )}
                  <Link
                    to={`/experiment/${exp.id}`}
                    className="focus-sparken shrink-0 font-body text-[10px] font-semibold text-[var(--color-purple)] underline underline-offset-2"
                  >
                    Full page →
                  </Link>
                </div>
                <div className="flex min-h-[14px] min-w-0 flex-1 gap-0.5 overflow-hidden rounded-sm">
                  {metrics.length === 0 ? (
                    <span className="font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">No metrics</span>
                  ) : (
                    metrics.map((m) => (
                      <span
                        key={m.id}
                        title={`${m.label}: ${m.status ?? 'pending'}${m.assignee_email?.trim() ? ` · Target owner: ${m.assignee_email.trim()}` : ''}`}
                        className="min-w-[6px] flex-1 rounded-[1px]"
                        style={{ backgroundColor: statusSegmentColor(m.status) }}
                      />
                    ))
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Target (hypothesis / goal text) vs current + dual bar: numeric when possible, else status fill */
export function TargetVsCurrentMatrix({ experiments, canEdit = false, onUpdateMetric, onUpdateExperiment }) {
  const list = experiments ?? []
  const rows = []
  for (const exp of list) {
    for (const m of exp.metrics ?? []) {
      rows.push({ exp, metric: m })
    }
  }
  if (!rows.length) return null

  const barW = 140

  if (canEdit && onUpdateMetric && onUpdateExperiment) {
    return (
      <div className="max-h-[min(70vh,28rem)] overflow-auto rounded border border-[var(--color-lavender)]">
        <p className="font-sparken-label sticky top-0 z-[1] border-b border-[var(--color-lavender)] bg-[var(--color-white)] px-3 py-2 text-[var(--color-purple)]">
          Target vs current (edit metrics)
        </p>
        <div className="divide-y divide-[var(--color-lavender)] px-3 py-2">
          {list.map((exp) => (
            <section key={exp.id} className="py-4 first:pt-2">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-metric m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Experiment</p>
                  <InlineExperimentTitle experiment={exp} onUpdateExperiment={onUpdateExperiment} className="text-[12px]" />
                  <p className="font-metric m-0 mb-0.5 mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">
                    Program target owner (email)
                  </p>
                  <InlineExperimentTargetOwnerEmail
                    experiment={exp}
                    onUpdateExperiment={onUpdateExperiment}
                    className="text-[12px] font-normal normal-case"
                  />
                </div>
                <Link
                  to={`/experiment/${exp.id}`}
                  className="focus-sparken shrink-0 font-body text-[11px] font-semibold text-[var(--color-purple)] underline"
                >
                  Open full page →
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {(exp.metrics ?? []).length ? (
                  (exp.metrics ?? []).map((m) => <MetricFullEditRow key={m.id} metric={m} onUpdateMetric={onUpdateMetric} />)
                ) : (
                  <p className="m-0 font-body text-[12px] text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">No metrics for this experiment.</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[min(70vh,28rem)] overflow-auto rounded border border-[var(--color-lavender)]">
      <p className="font-sparken-label sticky top-0 z-[1] border-b border-[var(--color-lavender)] bg-[var(--color-white)] px-3 py-2 text-[var(--color-purple)]">
        Target vs current (visual)
      </p>
      <table className="w-full border-collapse font-body text-[12px]">
        <thead className="sticky top-8 z-[1] bg-[color-mix(in_srgb,var(--color-lavender)_25%,white)] text-left text-[color-mix(in_srgb,var(--color-purple)_85%,transparent)]">
          <tr>
            <th className="px-3 py-2 font-semibold">Experiment</th>
            <th className="px-3 py-2 font-semibold">Program target owner (email)</th>
            <th className="px-3 py-2 font-semibold">Metric</th>
            <th className="px-3 py-2 font-semibold">Target owner (email)</th>
            <th className="px-3 py-2 font-semibold">Target (upper bound)</th>
            <th className="px-3 py-2 font-semibold">Current</th>
            <th className="px-3 py-2 font-semibold">Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ exp, metric: m }) => {
            const targetNum = effectiveTargetUpperBound(m)
            const currentNum = parseLooseNumber(m.current_value)
            const numProg = numericProgress(currentNum, targetNum)
            const fill = numProg != null ? numProg : statusFillFraction(m.status)
            const track =
              numProg != null
                ? 'Progress from logged current toward the numeric target'
                : 'Progress follows status until current and target are both numbers'

            return (
              <tr key={m.id} className="border-t border-[var(--color-lavender)]">
                <td className="max-w-[7rem] truncate px-3 py-2 align-middle text-[var(--color-black)]">{exp.title}</td>
                <td className="max-w-[9rem] break-all px-3 py-2 align-middle text-[color-mix(in_srgb,var(--color-purple)_75%,var(--color-black))]">
                  {exp.target_owner_email?.trim() || '—'}
                </td>
                <td className="max-w-[8rem] truncate px-3 py-2 align-middle font-semibold text-[var(--color-black)]">{m.label}</td>
                <td className="max-w-[9rem] break-all px-3 py-2 align-middle text-[color-mix(in_srgb,var(--color-purple)_75%,var(--color-black))]">
                  {m.assignee_email || '—'}
                </td>
                <td className="max-w-[14rem] px-3 py-2 align-middle font-metric tabular-nums text-[color-mix(in_srgb,var(--color-purple)_80%,transparent)]">
                  {formatMetricTargetDisplay(m)}
                </td>
                <td className="max-w-[10rem] px-3 py-2 align-middle text-[var(--color-black)]">{m.current_value || '—'}</td>
                <td className="px-3 py-2 align-middle">
                  <svg width={barW} height={22} viewBox={`0 0 ${barW} 22`} className="max-w-full" role="img" aria-label={track}>
                    <title>{track}</title>
                    <rect x={0} y={6} width={barW} height={10} rx={2} fill="var(--color-lavender)" opacity={0.35} />
                    <rect
                      x={0}
                      y={6}
                      width={Math.max(2, fill * barW)}
                      height={10}
                      rx={2}
                      fill={statusBarColor(m.status)}
                    />
                  </svg>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="border-t border-[var(--color-lavender)] px-3 py-2 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_70%,transparent)]">
        Each metric’s target is <strong className="font-semibold text-[var(--color-black)]">one number</strong> (the agreed upper bound) everywhere in the app. The bar shows rough progress when the logged current and that target are both numeric; otherwise the fill reflects status (pending = thin, on track = full).
      </p>
    </div>
  )
}

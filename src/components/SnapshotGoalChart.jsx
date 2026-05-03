import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import HelpTip from './HelpTip'
import {
  ExperimentHypothesisGoalsForm,
  ExperimentResearchAndTargetsBlock,
  InlineExperimentTitle,
} from './InlineExperimentFields'
import { MetricFullEditRow } from './MetricsTable'
import { experimentSnapshotSummary } from '../lib/experimentSummary'
import {
  experimentRollupFromMetrics,
  formatMetricTargetDisplay,
  metricBulletLayout,
  signalBorderClass,
  statusBarColor,
} from '../lib/metricVisual'

function displayValue(raw) {
  if (raw == null) return '—'
  const s = String(raw).trim()
  return s === '' ? '—' : s
}

/** @param {string} status */
function nowPillFrameClass(status) {
  const s = status || 'pending'
  if (s === 'on_track') {
    return 'border-[var(--color-yellow)] bg-[color-mix(in_srgb,var(--color-yellow)_42%,white)] text-[var(--color-black)]'
  }
  if (s === 'warning') {
    return 'border-[color-mix(in_srgb,var(--color-lime)_75%,var(--color-black))] bg-[color-mix(in_srgb,var(--color-lime)_38%,white)] text-[var(--color-black)]'
  }
  if (s === 'off_track') {
    return 'border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_14%,white)] text-[var(--color-black)]'
  }
  return 'border-[color-mix(in_srgb,var(--color-purple)_28%,var(--color-lavender))] bg-[color-mix(in_srgb,var(--color-lavender)_35%,white)] text-[var(--color-black)]'
}

function StatusMiniPills({ counts }) {
  const items = [
    { key: 'on', label: 'On', n: counts.on_track, active: counts.on_track > 0 },
    { key: 'warn', label: 'Warn', n: counts.warning, active: counts.warning > 0 },
    { key: 'off', label: 'Off', n: counts.off_track, active: counts.off_track > 0 },
    { key: 'pend', label: 'Pending', n: counts.pending, active: counts.pending > 0 },
  ]
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(({ key, label, n, active }) => (
        <span
          key={key}
          className={`inline-flex items-baseline gap-0.5 rounded-full border px-2 py-0.5 font-body text-[11px] tabular-nums ${
            active
              ? 'border-[var(--color-purple)] bg-[color-mix(in_srgb,var(--color-lavender)_22%,white)] text-[var(--color-black)]'
              : 'border-transparent bg-[color-mix(in_srgb,var(--color-lavender)_12%,white)] text-[color-mix(in_srgb,var(--color-purple)_45%,transparent)]'
          }`}
        >
          <span className="font-semibold text-[var(--color-purple)]">{label}</span>
          <span className="font-metric">{n}</span>
        </span>
      ))}
    </div>
  )
}

function GoalMarker({ solid }) {
  if (solid) {
    return (
      <div
        className="pointer-events-none absolute top-1/2 right-0 z-[2] h-[calc(100%+8px)] w-[2px] -translate-y-1/2 rounded-full bg-[var(--color-purple)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-purple)_35%,transparent)]"
        aria-hidden
      />
    )
  }
  return (
    <div
      className="pointer-events-none absolute top-1/2 right-0 z-[2] h-[calc(100%+10px)] w-0 -translate-y-1/2 border-r-2 border-dashed border-[var(--color-purple)] opacity-80"
      aria-hidden
    />
  )
}

function ProgressMeter({ layout, caption }) {
  const pct = Math.max(2, Math.round(layout.fillFraction * 100))
  return (
    <div className="min-w-0">
      {caption ? (
        <p className="mb-1.5 font-metric text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
          {caption}
        </p>
      ) : null}
      <div
        className="relative w-full overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--color-lavender)_32%,white)] ring-1 ring-[color-mix(in_srgb,var(--color-purple)_16%,var(--color-lavender))] h-3"
        title="Fill shows how far you are toward the target on the right."
      >
        <div
          className="absolute inset-y-0 left-0 z-[1] rounded-md"
          style={{
            width: `${pct}%`,
            background: layout.fillColor,
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-black) 7%, transparent)',
          }}
        />
        <GoalMarker solid={layout.solidGoal} />
      </div>
      <div className="mt-1 flex justify-between font-body text-[10px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
        <span>Start (0)</span>
        <span className="font-semibold text-[var(--color-purple)]">Goal →</span>
      </div>
    </div>
  )
}

function MetricTargetNowCard({ metric, canEdit, onUpdateMetric }) {
  const layout = metricBulletLayout(metric)
  const status = metric.status || 'pending'
  const targetShown = formatMetricTargetDisplay(metric)
  const nowShown = displayValue(metric.current_value)

  if (canEdit && onUpdateMetric) {
    return (
      <li className="rounded-lg border border-[color-mix(in_srgb,var(--color-lavender)_80%,var(--color-purple))] bg-[var(--color-white)] p-3 shadow-sm">
        <MetricFullEditRow metric={metric} onUpdateMetric={onUpdateMetric} />
        <div className="mt-4 border-t border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] pt-3">
          <ProgressMeter layout={layout} caption="Progress toward target" />
          <p className="mt-2 m-0 text-right font-metric text-[12px] font-semibold tabular-nums text-[var(--color-purple)]">{layout.rightLabel}</p>
        </div>
      </li>
    )
  }

  return (
    <li className="rounded-lg border border-[color-mix(in_srgb,var(--color-lavender)_80%,var(--color-purple))] bg-[var(--color-white)] p-3 shadow-sm">
      <p className="m-0 font-body text-[13px] font-bold leading-snug text-[var(--color-black)]">{metric.label}</p>
      <p className="mt-1 m-0 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
        <span className="font-metric font-bold uppercase tracking-wide text-[var(--color-purple)]">Target owner (email)</span>{' '}
        <span className="break-all text-[var(--color-black)]">{displayValue(metric.assignee_email)}</span>
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col rounded-md border-2 border-[var(--color-purple)] bg-[color-mix(in_srgb,var(--color-purple)_6%,white)] px-2.5 py-2">
            <span className="font-metric text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-purple)]">Target</span>
            <span className="mt-1 font-body text-[13px] font-semibold leading-snug text-[var(--color-black)] break-words">{targetShown}</span>
            <span className="mt-1 font-body text-[10px] text-[color-mix(in_srgb,var(--color-purple)_65%,transparent)]">What we aim for</span>
          </div>
          <div className={`flex min-w-0 flex-1 flex-col rounded-md border-2 px-2.5 py-2 ${nowPillFrameClass(status)}`}>
            <span className="font-metric text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--color-black)_78%,transparent)]">
              Now
            </span>
            <span className="mt-1 font-body text-[13px] font-semibold leading-snug break-words">{nowShown}</span>
            <span className="mt-1 font-body text-[10px] opacity-90">Latest logged value</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col justify-center sm:w-[7.5rem]">
          <span className="font-metric text-[10px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
            Status
          </span>
          <span
            className="mt-1 inline-flex w-fit rounded-md px-2 py-1 font-body text-[12px] font-semibold capitalize"
            style={{ background: layout.fillColor, color: 'var(--color-black)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-black) 8%, transparent)' }}
          >
            {status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] pt-3">
        <ProgressMeter layout={layout} caption="Progress toward target" />
        <p className="mt-2 m-0 text-right font-metric text-[12px] font-semibold tabular-nums text-[var(--color-purple)]">{layout.rightLabel}</p>
      </div>
    </li>
  )
}

function ExperimentSnapshotBlock({
  experiment,
  detailsRef,
  openExperimentId,
  onOpenExperimentIdChange,
  canEdit,
  onUpdateMetric,
  onUpdateExperiment,
}) {
  const metrics = experiment.metrics ?? []
  const rollup = experimentRollupFromMetrics(metrics)
  const rollupPct = rollup.avgNumericGoalFraction != null ? Math.round(rollup.avgNumericGoalFraction * 100) : 0
  const rollupLayout = {
    fillFraction: rollup.avgNumericGoalFraction ?? 0,
    fillColor: statusBarColor(rollup.worst),
    solidGoal: true,
    rightLabel:
      rollup.avgNumericGoalFraction != null
        ? `About ${rollupPct}% of the way to targets (averaged across metrics that have both a logged value and a numeric target).`
        : `Stays at 0% until each metric has a logged current value and a numeric target so we can compare them.`,
  }
  const summary = experimentSnapshotSummary(experiment)

  return (
    <details
      ref={detailsRef}
      className={`group rounded-lg border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-white)_94%,var(--color-lavender))] shadow-sm ${signalBorderClass(rollup.worst)}`}
      onToggle={(e) => {
        const el = e.currentTarget
        if (el.open) {
          onOpenExperimentIdChange?.(experiment.id)
        } else if (openExperimentId === experiment.id) {
          onOpenExperimentIdChange?.(null)
        }
      }}
    >
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-lavender)] bg-[var(--color-white)] text-[var(--color-purple)]">
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 transition-transform duration-200 group-open:rotate-90"
              fill="currentColor"
              aria-hidden
            >
              <path d="M7 4l6 6-6 6V4z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block min-w-0 break-words font-body text-[14px] font-bold uppercase tracking-wide text-[var(--color-black)]">{experiment.title}</span>
            {summary ? (
              <span className="mt-1 block whitespace-normal break-words font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_78%,var(--color-black))]">
                {summary}
              </span>
            ) : (
              <span className="mt-1 block font-body text-[10px] italic leading-snug text-[color-mix(in_srgb,var(--color-purple)_50%,transparent)]">
                Add a question on the full experiment page for a one-line blurb.
              </span>
            )}
            <span className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <StatusMiniPills counts={rollup.counts} />
              <span className="flex min-w-0 flex-wrap items-center gap-1.5 font-metric text-[12px] font-semibold text-[color-mix(in_srgb,var(--color-purple)_88%,transparent)]">
                <span className="min-w-0 break-words">
                  {metrics.length} metric{metrics.length === 1 ? '' : 's'} · {rollupPct}% toward targets
                </span>
                {metrics.length ? <HelpTip text={rollupLayout.rightLabel} size="sm" /> : null}
              </span>
            </span>
            {experiment.target_owner_email?.trim() ? (
              <span className="mt-1.5 block whitespace-normal break-words font-body text-[10px] text-[color-mix(in_srgb,var(--color-purple)_72%,var(--color-black))]">
                Program target owner: <span className="break-all font-semibold">{experiment.target_owner_email.trim()}</span>
              </span>
            ) : (
              <span className="mt-1.5 block font-body text-[10px] italic text-[color-mix(in_srgb,var(--color-purple)_48%,transparent)]">
                Program target owner (email) not set
              </span>
            )}
          </span>
        </span>
      </summary>

      <div className="border-t border-[color-mix(in_srgb,var(--color-lavender)_65%,transparent)] px-4 pb-4">
        <div className="pt-3">
          <Link
            to={`/experiment/${experiment.id}`}
            className="inline-flex font-body text-[12px] font-semibold text-[var(--color-purple)] underline decoration-2 underline-offset-2 hover:text-[var(--color-black)]"
          >
            Full experiment page (all fields and charts) →
          </Link>
        </div>

        <div className="mt-4">
          <ExperimentResearchAndTargetsBlock
            experiment={experiment}
            canEdit={Boolean(canEdit && onUpdateExperiment)}
            onUpdateExperiment={onUpdateExperiment}
          />
        </div>

        <div className="mt-5 space-y-4">
          {canEdit && onUpdateExperiment ? (
            <div className="rounded-lg border border-[var(--color-lavender)] bg-[var(--color-white)] p-3">
              <p className="font-metric m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Experiment title</p>
              <InlineExperimentTitle experiment={experiment} onUpdateExperiment={onUpdateExperiment} className="text-[13px]" />
            </div>
          ) : null}

          {canEdit && onUpdateExperiment ? (
            <ExperimentHypothesisGoalsForm experiment={experiment} onUpdateExperiment={onUpdateExperiment} />
          ) : null}

          {metrics.length ? (
            <>
              <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-purple)_22%,var(--color-lavender))] bg-[color-mix(in_srgb,var(--color-purple)_4%,white)] p-3">
                <p className="m-0 font-body text-[12px] font-bold text-[var(--color-black)]">Experiment roll-up</p>
                <p className="mt-1 m-0 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
                  Average where each metric has a logged current value and a numeric target; otherwise the bar follows status. Color matches the worst metric in this experiment.
                </p>
                <div className="mt-3 min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <p className="m-0 font-metric text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
                      Experiment average toward targets
                    </p>
                    <HelpTip text={rollupLayout.rightLabel} size="sm" />
                  </div>
                  <ProgressMeter layout={rollupLayout} caption={null} />
                </div>
              </div>

              <div>
                <p className="mb-3 font-metric text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-purple)]">
                  Each metric — target vs now
                </p>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {metrics.map((m) => (
                    <MetricTargetNowCard key={m.id} metric={m} canEdit={canEdit} onUpdateMetric={onUpdateMetric} />
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="m-0 font-body text-[13px] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">No metrics yet for this experiment.</p>
          )}
        </div>
      </div>
    </details>
  )
}

/**
 * Snapshot by experiment: collapsed details; expanded view shows explicit Target vs Now and progress meters.
 * @param {{ experiments?: unknown[], openExperimentId?: string | null, onOpenExperimentIdChange?: (id: string | null) => void }} props
 */
export default function SnapshotGoalChart({
  experiments,
  openExperimentId = null,
  onOpenExperimentIdChange,
  canEdit = false,
  onUpdateMetric,
  onUpdateExperiment,
}) {
  const list = experiments ?? []
  const hasAnyMetric = list.some((e) => (e.metrics?.length ?? 0) > 0)
  const detailsRefs = useRef(new Map())

  const setDetailsRef = (id, el) => {
    if (el) detailsRefs.current.set(id, el)
    else detailsRefs.current.delete(id)
  }

  useEffect(() => {
    if (!openExperimentId) return
    detailsRefs.current.forEach((el, id) => {
      if (el) el.open = id === openExperimentId
    })
    const raf = requestAnimationFrame(() => {
      detailsRefs.current.get(openExperimentId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    return () => cancelAnimationFrame(raf)
  }, [openExperimentId])

  if (!list.length) {
    return (
      <div className="rounded border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_12%,white)] px-3 py-4 text-center font-body text-[13px] text-[color-mix(in_srgb,var(--color-purple)_70%,transparent)]">
        No experiments to show yet.
      </div>
    )
  }

  return (
    <div>
      <p className="font-sparken-label mb-1 text-[var(--color-purple)]">Targets &amp; logged values</p>
      <p className="mb-4 max-w-3xl font-body text-[12px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_76%,transparent)]">
        From the <Link to="/" className="font-semibold text-[var(--color-purple)] underline underline-offset-2 hover:text-[var(--color-black)]">Snapshot</Link>, open{' '}
        <strong className="font-semibold text-[var(--color-black)]">Targets &amp; logged values</strong> on a card to land here, or expand any experiment below. Each row shows
        context, then every metric’s <strong className="text-[var(--color-purple)]">Target</strong> vs <strong className="text-[var(--color-black)]">Now</strong> with a simple progress bar. Signed in: edit inline. For the full card, use{' '}
        <Link to="/experiments" className="font-semibold text-[var(--color-purple)] underline underline-offset-2 hover:text-[var(--color-black)]">
          All experiments
        </Link>{' '}
        or the experiment page.
      </p>

      <div className="flex flex-col gap-3">
        {list.map((exp) => (
          <ExperimentSnapshotBlock
            key={exp.id}
            experiment={exp}
            detailsRef={(el) => setDetailsRef(exp.id, el)}
            openExperimentId={openExperimentId}
            onOpenExperimentIdChange={onOpenExperimentIdChange}
            canEdit={canEdit}
            onUpdateMetric={onUpdateMetric}
            onUpdateExperiment={onUpdateExperiment}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-lavender)] pt-4 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_82%,transparent)]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-6 w-10 rounded border-2 border-[var(--color-purple)] bg-[color-mix(in_srgb,var(--color-purple)_8%,white)]" />
          Target = goal we measure
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-6 w-10 rounded border-2 border-[var(--color-yellow)] bg-[color-mix(in_srgb,var(--color-yellow)_40%,white)]" />
          Now = latest value (on track uses yellow)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-8 rounded-sm bg-[var(--color-yellow)] ring-1 ring-[color-mix(in_srgb,var(--color-black)_10%,transparent)]" />
          Bar fill = progress
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-0.5 bg-[var(--color-purple)]" />
          Right edge = goal line
        </span>
        {!hasAnyMetric ? <span className="w-full text-[var(--color-danger)]">Add metrics to experiments to populate cards.</span> : null}
      </div>
    </div>
  )
}

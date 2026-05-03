import { Link } from 'react-router-dom'
import HelpTip from './HelpTip'
import { InlineExperimentTargetOwnerEmail, InlineExperimentTitle } from './InlineExperimentFields'
import { experimentSnapshotSummary } from '../lib/experimentSummary'
import { experimentRollupFromMetrics } from '../lib/metricVisual'

/** @param {string} worst */
function riskChrome(worst) {
  switch (worst) {
    case 'on_track':
      return {
        topBar: 'bg-emerald-600',
        frame: 'border-l-[6px] border-l-emerald-600 bg-[color-mix(in_srgb,#22c55e_11%,white)]',
        pill: 'bg-emerald-700 text-white',
        label: 'Healthy',
        barFill: '#16a34a',
      }
    case 'warning':
      return {
        topBar: 'bg-orange-500',
        frame: 'border-l-[6px] border-l-orange-500 bg-[color-mix(in_srgb,#f97316_12%,white)]',
        pill: 'bg-orange-600 text-white',
        label: 'Watch',
        barFill: '#ea580c',
      }
    case 'off_track':
      return {
        topBar: 'bg-[var(--color-danger)]',
        frame: 'border-l-[6px] border-l-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,white)]',
        pill: 'bg-[var(--color-danger)] text-white',
        label: 'At risk',
        barFill: 'var(--color-danger)',
      }
    default:
      return {
        topBar: 'bg-[color-mix(in_srgb,var(--color-purple)_40%,var(--color-lavender))]',
        frame: 'border-l-[6px] border-l-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_20%,white)]',
        pill: 'bg-[var(--color-purple)] text-white',
        label: 'Collecting data',
        barFill: '#5e5592',
      }
  }
}

function ExperimentPulseCard({ experiment, onOpenTargetsDetail, canEdit, onUpdateExperiment }) {
  const metrics = experiment.metrics ?? []
  const rollup = experimentRollupFromMetrics(metrics)
  const chrome = riskChrome(rollup.worst)
  const hasMetrics = metrics.length > 0
  const pct = rollup.avgNumericGoalFraction != null ? Math.round(rollup.avgNumericGoalFraction * 100) : 0
  const hasNumericProgress = rollup.avgNumericGoalFraction != null
  const summary = experimentSnapshotSummary(experiment)

  const pctHelp = !hasMetrics
    ? 'Add metrics to track progress toward targets.'
    : hasNumericProgress
      ? `Average across metrics where you have logged a current number and set a target (${metrics.length} total).`
      : `Log a current number next to each target to see a % here. You have ${metrics.length} metric${metrics.length === 1 ? '' : 's'}.`

  return (
    <article className={`min-w-0 rounded-lg border border-[var(--color-lavender)] shadow-sm ${chrome.frame}`}>
      <div className={`h-1.5 w-full rounded-t-lg ${chrome.topBar}`} aria-hidden />
      <div className="min-w-0 px-4 pb-4 pt-3">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 min-w-0 flex-1 font-body text-[13px] font-bold uppercase leading-snug tracking-wide text-[var(--color-black)]">
            {canEdit && onUpdateExperiment ? (
              <div className="flex flex-col gap-1.5">
                <InlineExperimentTitle experiment={experiment} onUpdateExperiment={onUpdateExperiment} className="text-[12px]" />
                <InlineExperimentTargetOwnerEmail
                  experiment={experiment}
                  onUpdateExperiment={onUpdateExperiment}
                  className="text-[11px] font-normal normal-case"
                />
                <button
                  type="button"
                  className="focus-sparken w-fit text-left font-body text-[11px] font-semibold text-[var(--color-purple)] underline decoration-2 underline-offset-2 hover:text-[var(--color-black)]"
                  onClick={() => onOpenTargetsDetail?.(experiment.id)}
                >
                  Open targets &amp; logged values →
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="text-left text-[var(--color-black)] underline decoration-[color-mix(in_srgb,var(--color-purple)_30%,transparent)] decoration-2 underline-offset-2 hover:text-[var(--color-purple)] focus-sparken"
                onClick={() => onOpenTargetsDetail?.(experiment.id)}
              >
                {experiment.title}
              </button>
            )}
          </h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-metric text-[10px] font-bold uppercase tracking-wide ${chrome.pill}`}>
            {chrome.label}
          </span>
        </div>

        {summary ? (
          <p className="mt-2 m-0 min-w-0 overflow-visible whitespace-normal break-words font-body text-[12px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_82%,var(--color-black))]">
            {summary}
          </p>
        ) : (
          <p className="mt-2 m-0 font-body text-[11px] italic leading-snug text-[color-mix(in_srgb,var(--color-purple)_52%,transparent)]">
            Add a question on the full experiment page for a one-line blurb.
          </p>
        )}

        {!(canEdit && onUpdateExperiment) ? (
          <p className="mt-2 m-0 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_76%,var(--color-black))]">
            <span className="font-metric font-bold uppercase tracking-wide text-[var(--color-purple)]">Program target owner</span>{' '}
            {experiment.target_owner_email?.trim() ? (
              <span className="break-all font-semibold text-[var(--color-black)]">{experiment.target_owner_email.trim()}</span>
            ) : (
              <span className="italic text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">Not set</span>
            )}
          </p>
        ) : null}

        <div className="mt-4">
          <p className="m-0 font-metric text-[11px] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
            Close to targets
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="m-0 font-metric text-[34px] font-bold leading-none tabular-nums tracking-tight text-[var(--color-black)]">
              {hasMetrics ? `${pct}%` : '—'}
            </p>
            <HelpTip text={pctHelp} />
          </div>
          <div
            className="mt-3 h-2.5 w-full max-w-[11rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-lavender)_45%,white)] ring-1 ring-[color-mix(in_srgb,var(--color-purple)_12%,transparent)]"
            title={hasMetrics && hasNumericProgress ? `${pct}% average toward numeric targets` : undefined}
            role={hasMetrics ? 'presentation' : undefined}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: hasMetrics ? `${pct}%` : '0%',
                backgroundColor: chrome.barFill,
                minWidth: hasMetrics && hasNumericProgress && pct > 0 ? '4px' : undefined,
              }}
            />
          </div>
        </div>
        <p className="m-0 mt-3 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
          <Link
            to={`/experiment/${experiment.id}`}
            className="font-semibold text-[var(--color-purple)] underline decoration-2 underline-offset-2 hover:text-[var(--color-black)]"
          >
            Full experiment page →
          </Link>
        </p>
      </div>
    </article>
  )
}

/** High-level snapshot: how close to targets + quick status color per experiment. */
export default function SnapshotPulseGrid({ experiments, onOpenTargetsDetail, canEdit = false, onUpdateExperiment }) {
  const list = experiments ?? []

  if (!list.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_10%,white)] px-4 py-6 text-center font-body text-[13px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
        No experiments yet.
      </div>
    )
  }

  return (
    <div>
      <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Snapshot</p>
      <p className="m-0 mb-4 max-w-3xl font-body text-[12px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_76%,transparent)]">
        One card per experiment: are we <strong className="font-semibold text-[var(--color-black)]">getting close to our targets</strong> or not? The big % is a simple average
        where you have logged a current number and set a target; otherwise it stays at <strong className="font-semibold text-[var(--color-black)]">0%</strong>. The color is a quick read
        from metric status — <strong className="text-emerald-800">green</strong> on track, <strong className="text-orange-600">orange</strong> watch,{' '}
        <strong className="text-[var(--color-danger)]">red</strong> at risk, <strong className="text-[var(--color-purple)]">purple</strong> still collecting data. Open{' '}
        <strong className="font-semibold text-[var(--color-black)]">Targets &amp; logged values</strong> for each metric, notes, and edits.
        {canEdit ? (
          <>
            {' '}
            Signed in: <strong className="font-semibold text-[var(--color-black)]">titles</strong> edit on the card (save on blur).
          </>
        ) : null}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((exp) => (
          <ExperimentPulseCard
            key={exp.id}
            experiment={exp}
            onOpenTargetsDetail={onOpenTargetsDetail}
            canEdit={canEdit}
            onUpdateExperiment={onUpdateExperiment}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
          Healthy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          Watch
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
          At risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-lavender)] ring-1 ring-[var(--color-purple)]" />
          Collecting data
        </span>
      </div>
    </div>
  )
}

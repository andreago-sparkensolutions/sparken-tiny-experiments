import ProgramWindowCaption from './ProgramWindowCaption'
import SnapshotPulseGrid from './SnapshotPulseGrid'
import { ExperimentMetricHeatstrip, StatusDistributionChart } from './SnapshotVisuals'
import { aggregateMetricHealth, healthVerdict } from '../lib/metricHealth'

const TONE_STYLES = {
  on_track: {
    border: 'border-l-4 border-l-[var(--color-yellow)]',
    headline: 'text-[var(--color-black)]',
  },
  warning: {
    border: 'border-l-4 border-l-[var(--color-lime)]',
    headline: 'text-[var(--color-black)]',
  },
  off_track: {
    border: 'border-l-4 border-l-[var(--color-danger)]',
    headline: 'text-[var(--color-black)]',
  },
  pending: {
    border: 'border-l-4 border-l-[var(--color-lavender)]',
    headline: 'text-[var(--color-black)]',
  },
}

function CountPill({ label, count }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_18%,var(--color-white))] px-2.5 py-1 font-body text-[12px] font-semibold text-[var(--color-black)]">
      <span className="text-[color-mix(in_srgb,var(--color-purple)_70%,transparent)]">{label}</span>
      <span className="font-metric tabular-nums text-[var(--color-black)]">{count}</span>
    </span>
  )
}

/**
 * @param {{ experiments: unknown[], canEdit?: boolean, onUpdateExperiment?: unknown, onOpenTargetsDetail?: (experimentId: string) => void }} props
 */
export default function SnapshotOverview({
  experiments,
  canEdit = false,
  onUpdateExperiment,
  onOpenTargetsDetail,
}) {
  const stats = aggregateMetricHealth(experiments)
  const verdict = healthVerdict(stats)
  const tone = TONE_STYLES[verdict.tone] ?? TONE_STYLES.pending

  return (
    <section
      className={`card-surface mb-6 w-full px-6 py-5 ${tone.border}`}
      aria-labelledby="snapshot-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Portfolio signal</p>
          <p className="font-metric m-0 mb-2 text-[11px] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_65%,transparent)]">
            Exec + PM view · business experiments as product surface area
          </p>
          <h2
            id="snapshot-heading"
            className={`font-headline m-0 text-[22px] font-normal uppercase leading-tight sm:text-[24px] ${tone.headline}`}
          >
            {verdict.headline}
          </h2>
          <p className="mt-2 max-w-2xl font-body text-[14px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
            {verdict.detail}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
          <CountPill label="On track" count={stats.on_track} />
          <CountPill label="Warning" count={stats.warning} />
          <CountPill label="Off track" count={stats.off_track} />
          <CountPill label="Pending" count={stats.pending} />
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--color-lavender)] pt-8">
        <StatusDistributionChart experiments={experiments} />
        <div className="mt-8">
          <ProgramWindowCaption className="mb-6" />
          <SnapshotPulseGrid
            experiments={experiments}
            onOpenTargetsDetail={onOpenTargetsDetail}
            canEdit={canEdit}
            onUpdateExperiment={onUpdateExperiment}
          />
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--color-lavender)] pt-8">
        <ExperimentMetricHeatstrip
          experiments={experiments}
          canEdit={canEdit}
          onUpdateExperiment={onUpdateExperiment}
        />
      </div>
    </section>
  )
}

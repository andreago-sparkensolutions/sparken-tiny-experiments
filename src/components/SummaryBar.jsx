import { aggregateMetricHealth } from '../lib/metricHealth'
import { formatRelativeTime, maxUpdatedAt } from '../lib/formatRelativeTime'

export default function SummaryBar({ experiments }) {
  const total = experiments?.length ?? 0
  const running = experiments?.filter((e) => e.status === 'running').length ?? 0
  const lastIso = maxUpdatedAt(experiments)
  const { on_track, warning, off_track, pending, total: kpiTotal } = aggregateMetricHealth(experiments)

  return (
    <div className="border-b border-[color-mix(in_srgb,var(--color-purple)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-purple)_8%,var(--color-black))]">
      <div className="h-0.5 w-full bg-[var(--color-yellow)]" aria-hidden />
      <div className="mx-auto max-w-[1400px] px-6 py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-metric inline-flex items-center gap-1.5 rounded-sm border border-[color-mix(in_srgb,var(--color-lavender)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_55%,transparent)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-lavender)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" title="Dashboard is live" />
              Live
            </span>
          </div>
          <p className="m-0 font-metric text-[11px] text-[color-mix(in_srgb,var(--color-lavender)_80%,transparent)]">
            Last sync <span className="text-[var(--color-yellow)]">{formatRelativeTime(lastIso)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 font-body text-[13px] text-[var(--color-lavender)]">
          <span>
            <span className="font-metric text-[15px] font-semibold text-[var(--color-white)]">{total}</span> programs
          </span>
          <span className="text-[color-mix(in_srgb,var(--color-lavender)_45%,transparent)]">·</span>
          <span>
            <span className="font-metric text-[15px] font-semibold text-[var(--color-yellow)]">{running}</span> running
          </span>
          <span className="text-[color-mix(in_srgb,var(--color-lavender)_45%,transparent)]">·</span>
          <span>
            <span className="font-metric text-[15px] font-semibold text-[var(--color-white)]">{kpiTotal}</span> KPIs tracked
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-metric text-[12px] text-[color-mix(in_srgb,var(--color-lavender)_88%,transparent)]">
          <span>
            <span className="font-semibold text-[var(--color-yellow)]">{on_track}</span> on track
          </span>
          <span>
            <span className="font-semibold text-[var(--color-lime)]">{warning}</span> warning
          </span>
          <span>
            <span className="font-semibold text-[var(--color-danger)]">{off_track}</span> off track
          </span>
          <span>
            <span className="font-semibold text-[var(--color-lavender)]">{pending}</span> pending
          </span>
        </div>
      </div>
    </div>
  )
}

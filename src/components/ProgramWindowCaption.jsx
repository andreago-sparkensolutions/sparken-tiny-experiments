import { formatProgramDayLong, formatProgramDayMedium, programEndJune, toDateKey } from '../lib/programWindow'

/**
 * Shows today’s date and the June program end for experiment snapshots.
 * @param {{ compact?: boolean, className?: string }} props
 */
export default function ProgramWindowCaption({ compact = false, className = '' }) {
  const today = new Date()
  const end = programEndJune(today)
  const todayLabel = formatProgramDayLong(today)
  const endLabel = formatProgramDayMedium(end)

  if (compact) {
    return (
      <p
        className={`m-0 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_76%,var(--color-black))] ${className}`.trim()}
      >
        <span className="font-semibold text-[var(--color-black)]">Today:</span>{' '}
        <time dateTime={toDateKey(today)}>{todayLabel}</time>
        <span className="text-[color-mix(in_srgb,var(--color-purple)_45%,transparent)]"> · </span>
        <span className="font-semibold text-[var(--color-black)]">Experiments through</span>{' '}
        <time dateTime={toDateKey(end)}>{endLabel}</time>
      </p>
    )
  }

  return (
    <div
      className={`rounded-md border border-[color-mix(in_srgb,var(--color-purple)_22%,var(--color-lavender))] bg-[color-mix(in_srgb,var(--color-purple)_5%,white)] px-4 py-3 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <p className="m-0 font-metric text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-purple)]">Program window</p>
      <p className="mt-1.5 m-0 font-body text-[13px] leading-snug text-[var(--color-black)]">
        <span className="font-semibold">Today</span> is{' '}
        <time dateTime={toDateKey(today)} className="tabular-nums">
          {todayLabel}
        </time>
        . These experiments are tracked <span className="font-semibold">from now through</span>{' '}
        <time dateTime={toDateKey(end)} className="tabular-nums">
          {endLabel}
        </time>
        .
      </p>
    </div>
  )
}

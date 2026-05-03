const STYLES = {
  running: 'bg-[var(--color-yellow)] text-[var(--color-black)]',
  on_deck: 'bg-[var(--color-lime)] text-[var(--color-black)]',
  complete: 'bg-[var(--color-lavender)] text-[var(--color-purple)]',
  stopped: 'bg-[var(--color-purple)] text-[var(--color-white)]',
}

const LABELS = {
  running: 'Running',
  on_deck: 'On Deck',
  complete: 'Complete',
  stopped: 'Stopped',
}

export default function StatusBadge({ status }) {
  const key = status && STYLES[status] ? status : 'on_deck'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  )
}

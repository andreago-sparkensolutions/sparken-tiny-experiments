import { useCallback, useEffect, useId, useRef, useState } from 'react'

/**
 * Tap- and desktop-friendly help: toggles on click (native `title` is flaky on touch and delayed on desktop).
 * @param {{ text: string, align?: 'left' | 'right', size?: 'sm' | 'md', className?: string }} props
 */
export default function HelpTip({ text, align = 'right', size = 'md', className = '' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const tipId = useId()
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let removePointer = () => {}
    const t = window.setTimeout(() => {
      if (cancelled) return
      const onDoc = (e) => {
        if (!wrapRef.current?.contains(e.target)) close()
      }
      document.addEventListener('pointerdown', onDoc)
      removePointer = () => document.removeEventListener('pointerdown', onDoc)
    }, 0)
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelled = true
      window.clearTimeout(t)
      removePointer()
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const btnSize = size === 'sm' ? 'h-5 w-5 text-[11px]' : 'h-6 w-6 text-[12px]'

  return (
    <span className={`relative inline-flex align-middle ${className}`} ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label="Show explanation"
        className={`focus-sparken inline-flex ${btnSize} shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-purple)_35%,var(--color-lavender))] bg-[color-mix(in_srgb,var(--color-lavender)_18%,white)] font-metric font-bold leading-none text-[var(--color-purple)] hover:bg-[color-mix(in_srgb,var(--color-lavender)_35%,white)]`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        ?
      </button>
      {open ? (
        <div
          id={tipId}
          role="tooltip"
          className={`absolute top-full z-[200] mt-1 w-max max-w-[min(20rem,calc(100vw-3rem))] rounded-md border border-[var(--color-lavender)] bg-[var(--color-white)] p-2.5 shadow-[0_8px_24px_rgba(3,4,3,0.14)] ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <p className="m-0 font-body text-[11px] leading-relaxed text-[var(--color-black)]">{text}</p>
        </div>
      ) : null}
    </span>
  )
}

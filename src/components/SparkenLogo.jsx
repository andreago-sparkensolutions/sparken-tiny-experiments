/**
 * Sparken wordmark — `/public/sparken-logo.png` (transparent background).
 */
export default function SparkenLogo({ variant = 'nav' }) {
  if (variant === 'modal') {
    return (
      <div className="flex justify-center px-2 py-2">
        <img
          src="/sparken-logo.png"
          alt="Sparken"
          decoding="async"
          className="mx-auto block h-auto max-h-32 w-full max-w-[min(100%,320px)] object-contain object-center sm:max-h-36"
        />
      </div>
    )
  }

  return (
    <div className="flex h-10 shrink-0 items-center sm:h-11">
      <img
        src="/sparken-logo.png"
        alt="Sparken"
        decoding="async"
        className="block h-8 w-auto max-w-[200px] object-contain object-left sm:h-9 sm:max-w-[240px]"
      />
    </div>
  )
}

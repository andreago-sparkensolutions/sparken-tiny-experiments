import { useEffect, useState } from 'react'
import SparkenLogo from './SparkenLogo'

export default function LoginModal({ open, onClose, onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const { error } = await onSignIn(email.trim(), password)
    setSubmitting(false)
    if (error) {
      setFormError(error.message ?? 'Sign in failed')
      return
    }
    setEmail('')
    setPassword('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(3,4,3,0.6)' }}>
      <div
        className="card-surface w-full max-w-md overflow-hidden rounded-sm shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <div className="bg-[var(--color-purple)] px-4 pb-5 pt-4">
          <h2 id="login-title" className="sr-only">
            Sparken
          </h2>
          <SparkenLogo variant="modal" />
        </div>
        <form className="p-6" onSubmit={handleSubmit}>
          <div className="mb-5 rounded border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_15%,white)] px-3 py-3 font-body text-[12px] leading-relaxed text-[var(--color-black)]">
            <p className="m-0 mb-2 font-semibold text-[var(--color-purple)]">How to sign in</p>
            <ol className="m-0 list-decimal space-y-1 pl-4">
              <li>
                In the Supabase dashboard for this project, open <strong>Authentication</strong> → <strong>Users</strong>.
              </li>
              <li>
                Click <strong>Add user</strong> → <strong>Create new user</strong>, enter the same email and password you will use here.
              </li>
              <li>
                Come back to this app, click <strong>Login</strong> in the top-right, and sign in with that email and password.
              </li>
            </ol>
          </div>
          {formError ? (
            <p className="mb-4 rounded border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_12%,white)] px-3 py-2 font-body text-[13px] text-[var(--color-black)]">
              {formError}
            </p>
          ) : null}
          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">
            Email
          </label>
          <input
            type="email"
            autoComplete="username"
            required
            className="focus-sparken mb-4 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="focus-sparken mb-6 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="focus-sparken w-full rounded-full bg-[var(--color-yellow)] py-3 font-body text-[15px] font-semibold text-[var(--color-black)] disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <button
            type="button"
            className="focus-sparken mt-4 w-full font-body text-[14px] font-semibold text-[var(--color-purple)]"
            onClick={onClose}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

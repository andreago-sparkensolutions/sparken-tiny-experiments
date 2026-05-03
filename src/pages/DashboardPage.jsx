import { useNavigate, useOutletContext } from 'react-router-dom'
import SnapshotOverview from '../components/SnapshotOverview'

export default function DashboardPage() {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    loading,
    error,
    experiments,
    supabaseConfigured,
    handleUpdateExperiment,
  } = useOutletContext()

  return (
    <>
      {supabaseConfigured && !error && !loading ? (
        <SnapshotOverview
          experiments={experiments}
          canEdit={isAuthenticated}
          onUpdateExperiment={handleUpdateExperiment}
          onOpenTargetsDetail={(id) => navigate(`/targets?open=${encodeURIComponent(id)}`)}
        />
      ) : null}

      {!supabaseConfigured ? (
        <p className="rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          Supabase env vars are missing. Copy <code className="text-[var(--color-purple)]">.env.example</code> to{' '}
          <code className="text-[var(--color-purple)]">.env</code> and set your project URL and anon key.
        </p>
      ) : null}

      {supabaseConfigured && error ? (
        <p className="mb-6 rounded border border-[var(--color-danger)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          Could not load experiments: {error.message}
        </p>
      ) : null}

      {loading ? <p className="font-body text-[14px] text-[var(--color-lavender)]">Loading…</p> : null}
    </>
  )
}

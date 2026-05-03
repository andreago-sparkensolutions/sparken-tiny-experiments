import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import ExperimentCard from '../components/ExperimentCard'

export default function ExperimentsListPage() {
  const navigate = useNavigate()
  const {
    setLoginOpen,
    setEditId,
    isAuthenticated,
    loading,
    error,
    experiments,
    supabaseConfigured,
    handleUpdateMetric,
    handleUpdateExperiment,
  } = useOutletContext()

  return (
    <div className="flex flex-col gap-8">
      <header className="card-surface px-6 py-5">
        <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Programs</p>
        <h1 className="font-headline m-0 text-[22px] font-normal uppercase leading-tight text-[var(--color-black)] sm:text-[26px]">
          All experiments
        </h1>
        <p className="mt-2 m-0 max-w-3xl font-body text-[13px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
          Full cards: observation, question, hypothesis, research, metrics, and saves when you are signed in. For target vs logged drill-down, use{' '}
          <Link to="/targets" className="font-semibold text-[var(--color-purple)] underline underline-offset-2 hover:text-[var(--color-black)]">
            Targets &amp; logged values
          </Link>
          .
        </p>
        <p className="mt-4 m-0">
          <Link
            to="/"
            className="font-body text-[13px] font-semibold text-[var(--color-purple)] underline decoration-2 underline-offset-2 hover:text-[var(--color-black)]"
          >
            ← Back to snapshot
          </Link>
        </p>
      </header>

      {!supabaseConfigured ? (
        <p className="rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          Configure Supabase to load experiments.
        </p>
      ) : null}

      {supabaseConfigured && error ? (
        <p className="rounded border border-[var(--color-danger)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          Could not load experiments: {error.message}
        </p>
      ) : null}

      {loading ? (
        <p className="font-body text-[14px] text-[var(--color-lavender)]">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {(experiments ?? []).map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              canEdit={isAuthenticated}
              onEdit={(id) => setEditId(id)}
              onUpdateMetric={handleUpdateMetric}
              onUpdateExperiment={handleUpdateExperiment}
              onGoToDetail={(id) => navigate(`/experiment/${id}`)}
              onRequestLogin={() => setLoginOpen(true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

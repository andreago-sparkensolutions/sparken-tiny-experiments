import { useMemo } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import ExperimentCard from '../components/ExperimentCard'
import { ExperimentMetricHeatstrip, StatusDistributionChart, TargetVsCurrentMatrix } from '../components/SnapshotVisuals'

export default function ExperimentDetailPage() {
  const { id } = useParams()
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

  const experiment = useMemo(() => experiments.find((e) => e.id === id), [experiments, id])

  if (!loading && !error && supabaseConfigured && id && experiments.length > 0 && !experiment) {
    return (
      <div className="card-surface p-8 text-center font-body text-[var(--color-black)]">
        <p className="mb-4">This experiment was not found.</p>
        <Link to="/" className="font-semibold text-[var(--color-purple)] underline">
          Back to snapshot
        </Link>
      </div>
    )
  }

  const singleList = experiment ? [experiment] : []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-yellow)]"
        >
          ← Back
        </button>
        {experiment ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="focus-sparken rounded-full border border-[var(--color-lavender)] bg-[var(--color-white)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-purple)] transition-transform hover:scale-[1.02]"
              onClick={() => navigate('/experiments')}
            >
              All experiments
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-black)] transition-transform hover:scale-[1.02]"
                onClick={() => setEditId(experiment.id)}
              >
                ✏️ Edit experiment
              </button>
            ) : (
              <button
                type="button"
                className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-black)]"
                onClick={() => setLoginOpen(true)}
              >
                Sign in to edit
              </button>
            )}
          </div>
        ) : null}
      </div>

      {experiment ? (
        <header className="card-surface px-6 py-5">
          <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Experiment</p>
          <h1 className="font-headline m-0 text-[22px] font-normal uppercase leading-tight text-[var(--color-black)] sm:text-[26px]">
            {experiment.title || 'Untitled'}
          </h1>
          <p className="mt-2 m-0 max-w-3xl font-body text-[12px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_78%,var(--color-black))]">
            <span className="font-metric font-bold uppercase tracking-wide text-[var(--color-purple)]">Program target owner (email)</span>{' '}
            {experiment.target_owner_email?.trim() ? (
              <span className="break-all font-semibold">{experiment.target_owner_email.trim()}</span>
            ) : (
              <span className="italic text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">Not set</span>
            )}
          </p>
          <p className="mt-2 m-0 max-w-3xl font-body text-[13px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
            Context charts are below. The full experiment card — observation, hypothesis, metrics, and edits when signed in — is at the bottom.
          </p>
        </header>
      ) : null}

      {supabaseConfigured && !error && !loading && experiment ? (
        <section className="card-surface p-6">
          <p className="font-sparken-label m-0 mb-4 text-[var(--color-purple)]">Portfolio + this experiment</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <StatusDistributionChart experiments={experiments} />
            <div>
              <p className="font-body mb-2 text-[12px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">This experiment’s metric strip</p>
              <ExperimentMetricHeatstrip
                experiments={[experiment]}
                canEdit={isAuthenticated}
                onUpdateExperiment={handleUpdateExperiment}
              />
            </div>
          </div>
        </section>
      ) : null}

      {supabaseConfigured && !error && !loading && experiment ? (
        <section className="card-surface overflow-hidden p-0">
          <TargetVsCurrentMatrix
            experiments={singleList}
            canEdit={isAuthenticated}
            onUpdateMetric={handleUpdateMetric}
            onUpdateExperiment={handleUpdateExperiment}
          />
        </section>
      ) : null}

      {experiment ? (
        <section className="card-surface px-6 py-5">
          <p className="font-sparken-label m-0 mb-4 text-[var(--color-purple)]">Full experiment record</p>
          <div className="max-w-5xl">
            <ExperimentCard
              experiment={experiment}
              canEdit={isAuthenticated}
              onEdit={(expId) => setEditId(expId)}
              onUpdateMetric={handleUpdateMetric}
              onUpdateExperiment={handleUpdateExperiment}
              onRequestLogin={() => setLoginOpen(true)}
              disableNavigation
              metricsReadOnlyDetail={!isAuthenticated}
            />
          </div>
        </section>
      ) : loading ? (
        <p className="font-body text-[14px] text-[var(--color-lavender)]">Loading…</p>
      ) : null}
    </div>
  )
}

import { useCallback } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import ProgramWindowCaption from '../components/ProgramWindowCaption'
import SnapshotGoalChart from '../components/SnapshotGoalChart'

export default function TargetsDetailPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const openExperimentId = searchParams.get('open') || null

  const {
    isAuthenticated,
    loading,
    error,
    experiments,
    supabaseConfigured,
    handleUpdateMetric,
    handleUpdateExperiment,
  } = useOutletContext()

  const onOpenExperimentIdChange = useCallback(
    (id) => {
      if (id) setSearchParams({ open: id }, { replace: true })
      else setSearchParams({}, { replace: true })
    },
    [setSearchParams]
  )

  const showContent = supabaseConfigured && !error && !loading && (experiments?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-8">
      <header className="card-surface px-6 py-5">
        <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Targets &amp; logged values</p>
        <h1 className="font-headline m-0 text-[22px] font-normal uppercase leading-tight text-[var(--color-black)] sm:text-[26px]">
          Per-metric detail
        </h1>
        <p className="mt-2 m-0 max-w-3xl font-body text-[13px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
          Expand an experiment for research notes, hypothesis, and each metric’s <strong className="text-[var(--color-purple)]">Target</strong> vs{' '}
          <strong className="text-[var(--color-black)]">Now</strong> — edit fields inline when you are signed in.
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

      {showContent ? (
        <>
          <ProgramWindowCaption compact className="px-1" />
          <section className="card-surface px-6 py-5">
            <SnapshotGoalChart
              experiments={experiments}
              openExperimentId={openExperimentId}
              onOpenExperimentIdChange={onOpenExperimentIdChange}
              canEdit={isAuthenticated}
              onUpdateMetric={handleUpdateMetric}
              onUpdateExperiment={handleUpdateExperiment}
            />
          </section>
        </>
      ) : loading ? (
        <p className="font-body text-[14px] text-[var(--color-lavender)]">Loading…</p>
      ) : !supabaseConfigured ? (
        <p className="rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          Configure Supabase to load experiments.
        </p>
      ) : error ? (
        <p className="rounded border border-[var(--color-danger)] bg-[var(--color-white)] p-4 font-body text-[14px] text-[var(--color-black)]">
          {error.message}
        </p>
      ) : (
        <p className="font-body text-[14px] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">No experiments yet.</p>
      )}
    </div>
  )
}

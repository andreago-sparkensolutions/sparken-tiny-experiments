import { useCallback, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import EditPanel from '../components/EditPanel'
import LoginModal from '../components/LoginModal'
import SparkenLogo from '../components/SparkenLogo'
import SummaryBar from '../components/SummaryBar'
import { supabaseConfigured } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import { useExperimentsContext } from '../lib/useExperimentsContext'

function mainNavLinkClass(pathname, path) {
  const active = pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
  return active
    ? 'rounded-full bg-[var(--color-yellow)] px-3 py-1.5 font-body text-[13px] font-semibold text-[var(--color-black)]'
    : 'rounded-full border border-[var(--color-lavender)] px-3 py-1.5 font-body text-[13px] font-semibold text-[var(--color-white)] hover:bg-[color-mix(in_srgb,white_10%,transparent)]'
}

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading: authLoading, isAuthenticated, signInWithPassword, signOut } = useAuth()
  const {
    experiments,
    loading: dataLoading,
    error,
    updateMetric,
    updateExperiment,
    createExperiment,
    saveExperimentWithMetrics,
  } = useExperimentsContext()

  const [loginOpen, setLoginOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const editingExperiment = useMemo(() => experiments.find((e) => e.id === editId) ?? null, [experiments, editId])

  const handleAddExperiment = useCallback(async () => {
    const { data, error: cError } = await createExperiment()
    if (!cError && data?.id) {
      setEditId(data.id)
      navigate(`/experiment/${data.id}`)
    }
  }, [createExperiment, navigate])

  const handleSavePanel = useCallback(
    async (experimentId, experimentFields, metricRows) => {
      return saveExperimentWithMetrics(experimentId, experimentFields, metricRows)
    },
    [saveExperimentWithMetrics]
  )

  const handleUpdateMetric = useCallback(
    async (metricId, patch) => {
      return updateMetric(metricId, patch)
    },
    [updateMetric]
  )

  const handleUpdateExperiment = useCallback(
    async (experimentId, patch) => {
      return updateExperiment(experimentId, patch)
    },
    [updateExperiment]
  )

  const loading = authLoading || dataLoading

  const outletContext = {
    setLoginOpen,
    setEditId,
    isAuthenticated,
    user,
    loading,
    error,
    experiments,
    supabaseConfigured,
    handleUpdateMetric,
    handleUpdateExperiment,
    handleSavePanel,
    handleAddExperiment,
    signOut,
  }

  return (
    <div className="sparken-canvas min-h-screen font-body text-[var(--color-white)]">
      <header className="sticky top-0 z-20 border-b border-[color-mix(in_srgb,var(--color-lavender)_30%,transparent)] bg-[var(--color-purple)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <Link to="/" className="focus-sparken rounded-sm outline-offset-4" aria-label="Dashboard home">
              <SparkenLogo variant="nav" />
            </Link>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-body text-[13px] text-[var(--color-lavender)]">
                Business experiment health · Q2 2026
              </span>
              <span className="font-metric text-[10px] uppercase tracking-wider text-[color-mix(in_srgb,var(--color-lavender)_72%,transparent)]">
                PM / ops view · hypothesis → metrics
              </span>
              {!isAuthenticated ? (
                <span className="font-body text-[11px] text-[color-mix(in_srgb,var(--color-lavender)_85%,transparent)]">
                  View-only · <button type="button" className="underline decoration-[var(--color-yellow)]" onClick={() => setLoginOpen(true)}>Sign in</button> to edit
                </span>
              ) : null}
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Main">
            <Link to="/" className={`focus-sparken ${mainNavLinkClass(location.pathname, '/')}`}>
              Snapshot
            </Link>
            <Link to="/targets" className={`focus-sparken ${mainNavLinkClass(location.pathname, '/targets')}`}>
              Targets
            </Link>
            <Link to="/experiments" className={`focus-sparken ${mainNavLinkClass(location.pathname, '/experiments')}`}>
              Experiments
            </Link>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="max-w-[200px] truncate font-body text-[13px] text-[var(--color-lavender)]">{user?.email}</span>
                <button
                  type="button"
                  className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-black)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleAddExperiment}
                >
                  + New Experiment
                </button>
                <button
                  type="button"
                  className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-yellow)]"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="focus-sparken rounded-full bg-[var(--color-yellow)] px-5 py-2 font-body text-[14px] font-semibold text-[var(--color-black)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setLoginOpen(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <SummaryBar experiments={experiments} />

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <Outlet context={outletContext} />
      </main>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignIn={(email, password) => signInWithPassword(email, password)}
      />

      <EditPanel
        open={Boolean(editId)}
        experiment={editingExperiment}
        onClose={() => setEditId(null)}
        onSave={handleSavePanel}
      />
    </div>
  )
}

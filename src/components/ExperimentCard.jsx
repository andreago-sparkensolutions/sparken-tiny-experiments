import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { signalBorderClass, statusSegmentColor, worstMetricSignal } from '../lib/metricVisual'
import MetricsTable from './MetricsTable'
import StatusBadge from './StatusBadge'

function buildDraft(exp) {
  return {
    title: exp.title ?? '',
    emoji: exp.emoji ?? '',
    status: exp.status ?? 'on_deck',
    category: exp.category ?? '',
    observation: exp.observation ?? '',
    question: exp.question ?? '',
    hypothesis: exp.hypothesis ?? '',
    experiment_description: exp.experiment_description ?? '',
    research_basis: exp.research_basis ?? '',
    hypothesized_target_note: exp.hypothesized_target_note ?? '',
    target_owner_email: exp.target_owner_email ?? '',
  }
}

function Divider() {
  return <hr className="my-5 border-0 border-t border-[var(--color-lavender)]" />
}

function FieldLabel({ icon, label }) {
  return (
    <p className="font-sparken-label m-0 mb-2 text-[var(--color-purple)]">
      {icon} {label}
    </p>
  )
}

export default function ExperimentCard({
  experiment,
  canEdit,
  onEdit,
  onUpdateMetric,
  onUpdateExperiment,
  onGoToDetail,
  onRequestLogin,
  disableNavigation = false,
  /** When true (e.g. signed-out experiment page), show every metric field in read-only cards. */
  metricsReadOnlyDetail = false,
}) {
  const [expanded, setExpanded] = useState(true)
  const [draft, setDraft] = useState(() => buildDraft(experiment))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    queueMicrotask(() => {
      setDraft(buildDraft(experiment))
      setSaveError(null)
    })
  }, [experiment])

  const category = experiment.category?.trim()
  const portfolioSignal = worstMetricSignal(experiment.metrics)
  const signalLabel =
    portfolioSignal === 'off_track'
      ? 'off track'
      : portfolioSignal === 'on_track'
        ? 'on track'
        : portfolioSignal === 'warning'
          ? 'warning'
          : 'pending / no signal'

  const dirty = useMemo(() => {
    const cur = buildDraft(experiment)
    return Object.keys(cur).some((k) => (draft[k] ?? '') !== (cur[k] ?? ''))
  }, [draft, experiment])

  const patchFromDraft = useCallback(() => {
    return {
      title: draft.title.trim() || 'Untitled',
      emoji: draft.emoji.trim() || null,
      status: draft.status,
      category: draft.category.trim() || null,
      observation: draft.observation.trim() || null,
      question: draft.question.trim() || null,
      hypothesis: draft.hypothesis.trim() || null,
      experiment_description: draft.experiment_description.trim() || null,
      research_basis: draft.research_basis.trim() || null,
      hypothesized_target_note: draft.hypothesized_target_note.trim() || null,
      target_owner_email: draft.target_owner_email.trim() === '' ? null : draft.target_owner_email.trim(),
    }
  }, [draft])

  const handleSaveCard = async () => {
    if (!onUpdateExperiment) return
    setSaving(true)
    setSaveError(null)
    const { error } = await onUpdateExperiment(experiment.id, patchFromDraft())
    setSaving(false)
    if (error) setSaveError(error.message ?? 'Save failed')
  }

  const handleDiscard = () => {
    setDraft(buildDraft(experiment))
    setSaveError(null)
  }

  const handleOuterDoubleClick = (e) => {
    if (disableNavigation || !onGoToDetail) return
    if (e.target.closest('textarea,button,select,input,a,option')) return
    onGoToDetail(experiment.id)
  }

  const displayTitle = (canEdit && expanded ? draft.title : experiment.title) || 'Untitled'
  const displayEmoji = canEdit && expanded ? draft.emoji : experiment.emoji

  return (
    <div
      className={`rounded-sm ${signalBorderClass(portfolioSignal)} ${
        disableNavigation
          ? ''
          : 'cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(94,85,146,0.18)]'
      }`}
      onDoubleClick={handleOuterDoubleClick}
      title={disableNavigation ? undefined : 'Double-click empty area for full detail page'}
    >
      <article className="card-surface flex flex-col overflow-hidden rounded-sm">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-black)_25%,transparent)] bg-[var(--color-purple)] px-5 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            {canEdit && expanded ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-start gap-2">
                  <textarea
                    className="focus-sparken h-11 w-14 shrink-0 resize-none rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_35%,transparent)] p-1 text-center font-body text-lg text-[var(--color-white)]"
                    rows={1}
                    value={draft.emoji}
                    onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))}
                    aria-label="Emoji"
                  />
                  <textarea
                    className="focus-sparken min-h-[2.75rem] flex-1 resize-y rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_35%,transparent)] p-2 font-headline text-[14px] font-normal uppercase leading-tight text-[var(--color-white)] sm:text-[15px]"
                    rows={2}
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    aria-label="Title"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="focus-sparken rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_35%,transparent)] px-2 py-1 font-body text-[12px] font-semibold text-[var(--color-white)]"
                    value={draft.status}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                    aria-label="Program status"
                  >
                    <option value="running">Running</option>
                    <option value="on_deck">On deck</option>
                    <option value="complete">Complete</option>
                    <option value="stopped">Stopped</option>
                  </select>
                  <textarea
                    className="focus-sparken min-h-[2rem] min-w-[8rem] flex-1 resize-y rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_35%,transparent)] px-2 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-[var(--color-lavender)]"
                    rows={1}
                    value={draft.category}
                    onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                    aria-label="Category"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  {displayEmoji ? (
                    <span className="shrink-0 text-xl" aria-hidden>
                      {displayEmoji}
                    </span>
                  ) : null}
                  <h2 className="m-0 font-headline text-[15px] font-normal uppercase leading-tight text-[var(--color-white)] sm:text-[16px]">
                    {displayTitle}
                  </h2>
                </div>
                <span className="font-metric text-[10px] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-lavender)_88%,transparent)]">
                  Program · worst KPI signal: {signalLabel}
                </span>
                {experiment.target_owner_email?.trim() ? (
                  <span className="mt-1 block truncate font-body text-[10px] text-[color-mix(in_srgb,var(--color-lavender)_95%,transparent)]" title="Program target owner (email)">
                    Program target owner:{' '}
                    <span className="break-all font-semibold">{experiment.target_owner_email.trim()}</span>
                  </span>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
            {!(canEdit && expanded) ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <StatusBadge status={experiment.status} />
                {category ? (
                  <span className="inline-flex rounded-full border border-[var(--color-lavender)] px-2.5 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-[var(--color-lavender)]">
                    {category}
                  </span>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              className="focus-sparken flex items-center gap-1 rounded border border-[color-mix(in_srgb,var(--color-lavender)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-black)_30%,transparent)] px-2 py-1 font-metric text-[11px] font-semibold uppercase tracking-wide text-[var(--color-lavender)] hover:bg-[color-mix(in_srgb,white_12%,transparent)]"
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation()
                setExpanded((v) => !v)
              }}
            >
              {expanded ? '▾ Collapse' : '▸ Expand'}
            </button>
          </div>
        </header>

        {expanded ? (
          <div className="p-6">
            {saveError ? (
              <p className="mb-4 rounded border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,white)] px-3 py-2 font-body text-[13px] text-[var(--color-black)]">
                {saveError}
              </p>
            ) : null}

            {canEdit ? (
              <>
                <div>
                  <FieldLabel icon="👀" label="Observation" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.observation}
                    onChange={(e) => setDraft((d) => ({ ...d, observation: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="❓" label="Question" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.question}
                    onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="💭" label="Hypothesis" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.hypothesis}
                    onChange={(e) => setDraft((d) => ({ ...d, hypothesis: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="🧪" label="Experiment" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.experiment_description}
                    onChange={(e) => setDraft((d) => ({ ...d, experiment_description: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="📚" label="Research referenced" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.research_basis}
                    onChange={(e) => setDraft((d) => ({ ...d, research_basis: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="🎯" label="Hypothesized targets" />
                  <textarea
                    className="focus-sparken min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    rows={4}
                    value={draft.hypothesized_target_note}
                    onChange={(e) => setDraft((d) => ({ ...d, hypothesized_target_note: e.target.value }))}
                  />
                </div>
                <Divider />
                <div>
                  <FieldLabel icon="✉️" label="Program target owner (email)" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="focus-sparken w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] leading-[1.6] text-[var(--color-black)]"
                    value={draft.target_owner_email}
                    onChange={(e) => setDraft((d) => ({ ...d, target_owner_email: e.target.value }))}
                    placeholder="name@company.com"
                  />
                  <p className="mt-2 m-0 font-body text-[12px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_68%,transparent)]">
                    Saves with <strong className="font-semibold text-[var(--color-black)]">Save card</strong> at the bottom (along with observation, metrics, etc.). Under Metrics, each target has its own owner field with its own{' '}
                    <strong className="font-semibold text-[var(--color-black)]">Save</strong> button.
                  </p>
                </div>
              </>
            ) : (
              <>
                <section>
                  <FieldLabel icon="👀" label="Observation" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.observation || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="❓" label="Question" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.question || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="💭" label="Hypothesis" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.hypothesis || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="🧪" label="Experiment" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.experiment_description || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="📚" label="Research referenced" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.research_basis || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="🎯" label="Hypothesized targets" />
                  <div className="font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.hypothesized_target_note || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
                <Divider />
                <section>
                  <FieldLabel icon="✉️" label="Program target owner (email)" />
                  <div className="break-all font-body text-[14px] leading-[1.6] text-[var(--color-black)]">
                    {experiment.target_owner_email?.trim() || (
                      <span className="text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">—</span>
                    )}
                  </div>
                </section>
              </>
            )}

            <Divider />
            <section>
              <FieldLabel icon="📊" label="Metrics" />
              {canEdit && expanded ? (
                <p className="mb-3 m-0 font-body text-[12px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_68%,transparent)]">
                  Each row: set <strong className="font-semibold text-[var(--color-black)]">Target owner (email)</strong> for that metric, then click{' '}
                  <strong className="font-semibold text-[var(--color-black)]">Save</strong> on that row (or use ✏️ to edit current value and status together).
                </p>
              ) : null}
              {experiment.metrics?.length ? (
                <div
                  className="mb-3 flex gap-0.5 rounded-sm border border-[var(--color-lavender)] p-1"
                  role="img"
                  aria-label="Quick glance at metric health by color"
                >
                  {experiment.metrics.map((m) => (
                    <span
                      key={m.id}
                      className="h-2 min-w-[8px] flex-1 rounded-sm"
                      style={{ backgroundColor: statusSegmentColor(m.status) }}
                    />
                  ))}
                </div>
              ) : null}
              <MetricsTable
                metrics={experiment.metrics}
                canEdit={canEdit}
                onUpdateMetric={onUpdateMetric}
                fullColumnEdit={canEdit && expanded}
                readOnlyDetail={metricsReadOnlyDetail && expanded}
              />
            </section>

            {canEdit && dirty ? (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-lavender)] pt-4">
                <button
                  type="button"
                  disabled={saving}
                  className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-black)] disabled:opacity-50"
                  onClick={handleSaveCard}
                >
                  {saving ? 'Saving…' : 'Save card'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-purple)] disabled:opacity-50"
                  onClick={handleDiscard}
                >
                  Discard changes
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border-t border-[var(--color-lavender)] bg-[var(--color-white)] px-5 py-4">
            {experiment.metrics?.length ? (
              <div
                className="mb-3 flex gap-0.5 rounded-sm border border-[var(--color-lavender)] p-1"
                role="img"
                aria-label="Metric health strip"
              >
                {experiment.metrics.map((m) => (
                  <span
                    key={m.id}
                    className="h-2 min-w-[8px] flex-1 rounded-sm"
                    style={{ backgroundColor: statusSegmentColor(m.status) }}
                  />
                ))}
              </div>
            ) : null}
            <p className="font-sparken-label m-0 mb-1 text-[var(--color-purple)]">Hypothesis (preview)</p>
            <p className="m-0 line-clamp-3 font-body text-[13px] leading-relaxed text-[color-mix(in_srgb,var(--color-purple)_88%,var(--color-black))]">
              {experiment.hypothesis || experiment.observation || '—'}
            </p>
            {experiment.target_owner_email?.trim() ? (
              <p className="mt-2 m-0 font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_78%,transparent)]">
                Program target owner: <span className="break-all font-semibold text-[var(--color-black)]">{experiment.target_owner_email.trim()}</span>
              </p>
            ) : null}
            <p className="mt-2 font-metric text-[10px] uppercase tracking-wider text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">
              Expand the card to edit all fields and metrics.
            </p>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-lavender)] px-6 py-4">
          <p className="m-0 font-body text-[13px] text-[var(--color-lavender)]">
            Updated {formatRelativeTime(experiment.updated_at ?? experiment.created_at)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {!disableNavigation && onGoToDetail ? (
              <button
                type="button"
                className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-purple)] underline decoration-[var(--color-lavender)] underline-offset-4 hover:text-[var(--color-black)]"
                onClick={() => onGoToDetail(experiment.id)}
              >
                Detail view →
              </button>
            ) : null}
            {canEdit ? (
              <button
                type="button"
                className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-yellow)]"
                onClick={() => onEdit(experiment.id)}
              >
                ✏️ Full editor
              </button>
            ) : (
              <button
                type="button"
                className="focus-sparken font-body text-[14px] font-semibold text-[var(--color-yellow)]"
                onClick={() => onRequestLogin?.()}
              >
                Sign in to edit
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  )
}

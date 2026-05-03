import { useCallback, useEffect, useMemo, useState } from 'react'

function emptyMetricRow(sortOrder) {
  return {
    id: undefined,
    label: '',
    target_value: '',
    current_value: '',
    warning_threshold: '',
    assignee_email: '',
    status: 'pending',
    sort_order: sortOrder,
    _delete: false,
  }
}

export default function EditPanel({ open, experiment, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  const [status, setStatus] = useState('on_deck')
  const [category, setCategory] = useState('')
  const [observation, setObservation] = useState('')
  const [question, setQuestion] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [experimentDescription, setExperimentDescription] = useState('')
  const [researchBasis, setResearchBasis] = useState('')
  const [hypothesizedTargetNote, setHypothesizedTargetNote] = useState('')
  const [targetOwnerEmail, setTargetOwnerEmail] = useState('')
  const [metricRows, setMetricRows] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const resetFromExperiment = useCallback((exp) => {
    if (!exp) return
    setTitle(exp.title ?? '')
    setEmoji(exp.emoji ?? '')
    setStatus(exp.status ?? 'on_deck')
    setCategory(exp.category ?? '')
    setObservation(exp.observation ?? '')
    setQuestion(exp.question ?? '')
    setHypothesis(exp.hypothesis ?? '')
    setExperimentDescription(exp.experiment_description ?? '')
    setResearchBasis(exp.research_basis ?? '')
    setHypothesizedTargetNote(exp.hypothesized_target_note ?? '')
    setTargetOwnerEmail(exp.target_owner_email ?? '')
    const rows = (exp.metrics ?? []).map((m, i) => ({
      id: m.id,
      label: m.label ?? '',
      target_value: m.target_value ?? '',
      current_value: m.current_value ?? '',
      warning_threshold: m.warning_threshold ?? '',
      assignee_email: m.assignee_email ?? '',
      status: m.status ?? 'pending',
      sort_order: m.sort_order ?? i,
      _delete: false,
    }))
    setMetricRows(rows)
    setSaveError(null)
  }, [])

  useEffect(() => {
    if (!open || !experiment) return
    queueMicrotask(() => {
      resetFromExperiment(experiment)
    })
  }, [open, experiment, resetFromExperiment])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const addMetricRow = () => {
    setMetricRows((prev) => {
      const nextOrder = prev.filter((r) => !r._delete).length
      return [...prev, emptyMetricRow(nextOrder)]
    })
  }

  const removeMetricRow = (index) => {
    setMetricRows((prev) => {
      const row = prev[index]
      const next = [...prev]
      if (row.id) next[index] = { ...row, _delete: true }
      else next.splice(index, 1)
      return next
    })
  }

  const updateMetricRow = (index, patch) => {
    setMetricRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  const visibleMetricRows = useMemo(() => metricRows.map((r, i) => ({ ...r, _index: i })).filter((r) => !r._delete), [metricRows])

  const handleSave = async () => {
    if (!experiment?.id) return
    setSaving(true)
    setSaveError(null)
    const experimentFields = {
      title: title.trim() || 'Untitled',
      emoji: emoji.trim() || null,
      status,
      category: category.trim() || null,
      observation: observation.trim() || null,
      question: question.trim() || null,
      hypothesis: hypothesis.trim() || null,
      experiment_description: experimentDescription.trim() || null,
      research_basis: researchBasis.trim() || null,
      hypothesized_target_note: hypothesizedTargetNote.trim() || null,
      target_owner_email: targetOwnerEmail.trim() === '' ? null : targetOwnerEmail.trim(),
    }
    const { error } = await onSave(experiment.id, experimentFields, metricRows)
    setSaving(false)
    if (error) {
      setSaveError(error.message ?? 'Save failed')
      return
    }
    onClose()
  }

  if (!open || !experiment) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0"
        style={{ backgroundColor: 'rgba(3,4,3,0.6)' }}
        aria-label="Close edit panel"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-[520px] flex-col bg-[var(--color-white)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-panel-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 bg-[var(--color-purple)] px-5 py-4">
          <h2 id="edit-panel-title" className="m-0 min-w-0 truncate font-headline text-[16px] font-normal uppercase text-[var(--color-white)]">
            Edit experiment
          </h2>
          <button
            type="button"
            className="focus-sparken shrink-0 rounded p-2 font-body text-[20px] leading-none text-[var(--color-white)] hover:bg-[color-mix(in_srgb,white_12%,transparent)]"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {saveError ? (
            <p className="mb-4 rounded border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,white)] px-3 py-2 font-body text-[13px] text-[var(--color-black)]">
              {saveError}
            </p>
          ) : null}

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Title</label>
          <textarea
            className="focus-sparken mb-4 min-h-[3rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Emoji</label>
          <textarea
            className="focus-sparken mb-4 min-h-[2.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={1}
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Status</label>
          <select
            className="focus-sparken mb-4 w-full rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="running">Running</option>
            <option value="on_deck">On Deck</option>
            <option value="complete">Complete</option>
            <option value="stopped">Stopped</option>
          </select>

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Category</label>
          <textarea
            className="focus-sparken mb-4 min-h-[2.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={1}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Observation</label>
          <textarea
            className="focus-sparken mb-4 min-h-[6rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Question</label>
          <textarea
            className="focus-sparken mb-4 min-h-[6rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Hypothesis</label>
          <textarea
            className="focus-sparken mb-4 min-h-[6rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Experiment</label>
          <textarea
            className="focus-sparken mb-4 min-h-[6rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={experimentDescription}
            onChange={(e) => setExperimentDescription(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Research referenced</label>
          <textarea
            className="focus-sparken mb-4 min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={researchBasis}
            onChange={(e) => setResearchBasis(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Hypothesized targets</label>
          <textarea
            className="focus-sparken mb-4 min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            rows={4}
            value={hypothesizedTargetNote}
            onChange={(e) => setHypothesizedTargetNote(e.target.value)}
          />

          <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">
            Program target owner (email)
          </label>
          <input
            type="email"
            autoComplete="email"
            className="focus-sparken mb-6 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
            value={targetOwnerEmail}
            onChange={(e) => setTargetOwnerEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <p className="m-0 mb-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Metrics</p>
          <p className="m-0 mb-3 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
            Program target owner is saved with the main <strong className="font-semibold text-[var(--color-black)]">Save</strong> footer button. Each metric row can set its own <strong className="font-semibold text-[var(--color-black)]">Target owner (email)</strong> — saved together on that same Save.
          </p>

          <div className="flex flex-col gap-4">
            {visibleMetricRows.map((row) => {
              const index = row._index
              return (
                <div key={row.id ?? `new-${index}`} className="rounded border border-[var(--color-lavender)] p-3">
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      className="focus-sparken rounded bg-[var(--color-purple)] px-2 py-1 font-body text-[12px] text-[var(--color-white)]"
                      aria-label="Delete metric row"
                      onClick={() => removeMetricRow(index)}
                    >
                      ✕
                    </button>
                  </div>
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Label</label>
                  <textarea
                    className="focus-sparken mb-2 min-h-[2.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    rows={1}
                    value={row.label}
                    onChange={(e) => updateMetricRow(index, { label: e.target.value })}
                  />
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Target</label>
                  <textarea
                    className="focus-sparken mb-2 min-h-[3rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    rows={2}
                    value={row.target_value}
                    onChange={(e) => updateMetricRow(index, { target_value: e.target.value })}
                  />
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Current value</label>
                  <textarea
                    className="focus-sparken mb-2 min-h-[4rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    rows={3}
                    value={row.current_value}
                    onChange={(e) => updateMetricRow(index, { current_value: e.target.value })}
                  />
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Warning threshold</label>
                  <textarea
                    className="focus-sparken mb-2 min-h-[3rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    rows={2}
                    value={row.warning_threshold}
                    onChange={(e) => updateMetricRow(index, { warning_threshold: e.target.value })}
                  />
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">
                    Target owner (email)
                  </label>
                  <input
                    type="email"
                    className="focus-sparken mb-2 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    value={row.assignee_email}
                    onChange={(e) => updateMetricRow(index, { assignee_email: e.target.value })}
                    placeholder="name@company.com"
                  />
                  <label className="mb-1 block font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-purple)]">Status</label>
                  <select
                    className="focus-sparken w-full rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
                    value={row.status}
                    onChange={(e) => updateMetricRow(index, { status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="on_track">On track</option>
                    <option value="warning">Warning</option>
                    <option value="off_track">Off track</option>
                  </select>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="focus-sparken mt-4 rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[14px] font-semibold text-[var(--color-black)]"
            onClick={addMetricRow}
          >
            Add metric row
          </button>
        </div>

        <footer className="shrink-0 border-t border-[var(--color-lavender)] p-5">
          <button
            type="button"
            disabled={saving}
            className="focus-sparken mb-3 w-full rounded-sm bg-[var(--color-yellow)] py-3 font-headline text-[16px] font-normal uppercase text-[var(--color-black)] disabled:opacity-60"
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            className="focus-sparken w-full font-body text-[14px] font-semibold text-[var(--color-purple)]"
            onClick={onClose}
          >
            Cancel
          </button>
        </footer>
      </aside>
    </div>
  )
}

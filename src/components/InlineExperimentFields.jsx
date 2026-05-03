import { useEffect, useState } from 'react'

/** Single-line title; saves on blur when changed. */
export function InlineExperimentTitle({ experiment, onUpdateExperiment, className = '' }) {
  const [value, setValue] = useState(experiment.title ?? '')

  useEffect(() => {
    queueMicrotask(() => setValue(experiment.title ?? ''))
  }, [experiment.id, experiment.title])

  const commit = async () => {
    if (!onUpdateExperiment) return
    const t = value.trim() || 'Untitled'
    if (t === (experiment.title ?? '').trim()) return
    await onUpdateExperiment(experiment.id, { title: t })
  }

  return (
    <input
      type="text"
      className={`focus-sparken w-full min-w-0 rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[var(--color-white)] px-2 py-1 font-body font-semibold text-[var(--color-black)] uppercase leading-snug tracking-wide ${className}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      aria-label="Experiment title"
    />
  )
}

/** Program-level target owner; explicit Save plus optional blur save. */
export function InlineExperimentTargetOwnerEmail({ experiment, onUpdateExperiment, className = '' }) {
  const [value, setValue] = useState(experiment.target_owner_email ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setValue(experiment.target_owner_email ?? '')
      setErr(null)
      setSavedFlash(false)
    })
  }, [experiment.id, experiment.target_owner_email])

  const serverNorm = (experiment.target_owner_email ?? '').trim() || null
  const nextNorm = value.trim() === '' ? null : value.trim()
  const dirty = nextNorm !== serverNorm

  const commit = async () => {
    if (!onUpdateExperiment || !dirty) return
    setErr(null)
    setSaving(true)
    const { error } = (await onUpdateExperiment(experiment.id, { target_owner_email: nextNorm })) ?? {}
    setSaving(false)
    if (error) {
      setErr(error.message ?? 'Save failed')
      return
    }
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-stretch gap-2">
        <input
          type="email"
          autoComplete="email"
          placeholder="Program target owner (email)"
          className={`focus-sparken min-w-0 flex-1 rounded border border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] bg-[var(--color-white)] px-2 py-1 font-body text-[var(--color-black)] ${className}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          aria-label="Program target owner email"
        />
        <button
          type="button"
          disabled={saving || !dirty}
          className="focus-sparken shrink-0 rounded border border-[var(--color-purple)] bg-[var(--color-yellow)] px-3 py-1 font-body text-[11px] font-semibold text-[var(--color-black)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => void commit()}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
      <p className="mt-1 m-0 font-body text-[10px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_62%,transparent)]">
        Saves when you click Save or leave this field (blur).
      </p>
      {err ? (
        <p className="mt-1 m-0 font-body text-[10px] text-[var(--color-danger)]">{err}</p>
      ) : savedFlash ? (
        <p className="mt-1 m-0 font-body text-[10px] font-semibold text-emerald-800">Saved.</p>
      ) : null}
    </div>
  )
}

/** Hypothesis + question (goal framing) with explicit save. */
export function ExperimentHypothesisGoalsForm({ experiment, onUpdateExperiment }) {
  const [hypothesis, setHypothesis] = useState(experiment.hypothesis ?? '')
  const [question, setQuestion] = useState(experiment.question ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    queueMicrotask(() => {
      setHypothesis(experiment.hypothesis ?? '')
      setQuestion(experiment.question ?? '')
      setErr(null)
    })
  }, [experiment.id, experiment.hypothesis, experiment.question])

  const save = async () => {
    if (!onUpdateExperiment) return
    setErr(null)
    setSaving(true)
    const { error } = await onUpdateExperiment(experiment.id, {
      hypothesis: hypothesis.trim() === '' ? null : hypothesis.trim(),
      question: question.trim() === '' ? null : question.trim(),
    })
    setSaving(false)
    if (error) setErr(error.message ?? 'Save failed')
  }

  return (
    <div className="rounded-lg border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_8%,white)] p-3">
      <p className="font-sparken-label m-0 mb-2 text-[var(--color-purple)]">Hypothesis and goals (program)</p>
      <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
        Hypothesis
      </label>
      <textarea
        className="focus-sparken mb-3 min-h-[4rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
        rows={3}
        value={hypothesis}
        onChange={(e) => setHypothesis(e.target.value)}
      />
      <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
        Question
      </label>
      <textarea
        className="focus-sparken mb-3 min-h-[3.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
        rows={2}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      {err ? (
        <p className="mb-2 m-0 rounded border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,white)] px-2 py-1 font-body text-[12px] text-[var(--color-black)]">
          {err}
        </p>
      ) : null}
      <button
        type="button"
        disabled={saving}
        className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[13px] font-semibold text-[var(--color-black)] disabled:opacity-50"
        onClick={save}
      >
        {saving ? 'Saving…' : 'Save hypothesis & goals'}
      </button>
    </div>
  )
}

/** Research basis + how numeric targets were chosen; read-only or inline save when editing. */
export function ExperimentResearchAndTargetsBlock({ experiment, onUpdateExperiment, canEdit = false }) {
  const [research, setResearch] = useState(experiment.research_basis ?? '')
  const [hypothesizedTargets, setHypothesizedTargets] = useState(experiment.hypothesized_target_note ?? '')
  const [targetOwnerEmail, setTargetOwnerEmail] = useState(experiment.target_owner_email ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    queueMicrotask(() => {
      setResearch(experiment.research_basis ?? '')
      setHypothesizedTargets(experiment.hypothesized_target_note ?? '')
      setTargetOwnerEmail(experiment.target_owner_email ?? '')
      setErr(null)
    })
  }, [experiment.id, experiment.research_basis, experiment.hypothesized_target_note, experiment.target_owner_email])

  const save = async () => {
    if (!onUpdateExperiment) return
    setErr(null)
    setSaving(true)
    const { error } = await onUpdateExperiment(experiment.id, {
      research_basis: research.trim() === '' ? null : research.trim(),
      hypothesized_target_note: hypothesizedTargets.trim() === '' ? null : hypothesizedTargets.trim(),
      target_owner_email: targetOwnerEmail.trim() === '' ? null : targetOwnerEmail.trim(),
    })
    setSaving(false)
    if (error) setErr(error.message ?? 'Save failed')
  }

  if (canEdit && onUpdateExperiment) {
    return (
      <div className="rounded-lg border border-[var(--color-lavender)] bg-[color-mix(in_srgb,var(--color-lavender)_8%,white)] p-3">
        <p className="font-sparken-label m-0 mb-2 text-[var(--color-purple)]">Research and hypothesized targets</p>
        <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
          Research referenced
        </label>
        <textarea
          className="focus-sparken mb-3 min-h-[5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
          rows={4}
          value={research}
          onChange={(e) => setResearch(e.target.value)}
          placeholder="Cite frameworks, benchmarks, or notes you relied on (seed data is prefilled for sample experiments)."
        />
        <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
          Hypothesized targets (how the numbers were chosen)
        </label>
        <textarea
          className="focus-sparken mb-3 min-h-[4rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
          rows={3}
          value={hypothesizedTargets}
          onChange={(e) => setHypothesizedTargets(e.target.value)}
          placeholder="Explain upper-bound targets: numeric bands use the top number, % bands use the top %, deadlines use the latest agreed date."
        />
        <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
          Program target owner (email)
        </label>
        <input
          type="email"
          autoComplete="email"
          className="focus-sparken mb-1 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
          value={targetOwnerEmail}
          onChange={(e) => setTargetOwnerEmail(e.target.value)}
          placeholder="name@company.com"
        />
        <p className="mb-3 m-0 font-body text-[10px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_58%,transparent)]">
          Persists when you click <strong className="font-semibold text-[var(--color-black)]">Save research &amp; targets</strong> below.
        </p>
        {err ? (
          <p className="mb-2 m-0 rounded border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,white)] px-2 py-1 font-body text-[12px] text-[var(--color-black)]">
            {err}
          </p>
        ) : null}
        <button
          type="button"
          disabled={saving}
          className="focus-sparken rounded-full bg-[var(--color-yellow)] px-4 py-2 font-body text-[13px] font-semibold text-[var(--color-black)] disabled:opacity-50"
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save research & targets'}
        </button>
      </div>
    )
  }

  const rb = (experiment.research_basis ?? '').trim()
  const ht = (experiment.hypothesized_target_note ?? '').trim()
  const owner = (experiment.target_owner_email ?? '').trim()

  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-purple)_18%,var(--color-lavender))] bg-[var(--color-white)] p-3 shadow-sm">
      <p className="font-sparken-label m-0 mb-2 text-[var(--color-purple)]">Research and hypothesized targets</p>
      <section className="mb-3">
        <p className="font-metric m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
          Program target owner (email)
        </p>
        <p className="m-0 break-all font-body text-[13px] leading-relaxed text-[var(--color-black)]">
          {owner || <span className="text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">Not set.</span>}
        </p>
      </section>
      <section className="mb-3 last:mb-0">
        <p className="font-metric m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
          Research referenced
        </p>
        <p className="m-0 font-body text-[13px] leading-relaxed text-[var(--color-black)]">
          {rb || <span className="text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">Not filled in yet.</span>}
        </p>
      </section>
      <section>
        <p className="font-metric m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--color-purple)_72%,transparent)]">
          Hypothesized targets
        </p>
        <p className="m-0 font-body text-[13px] leading-relaxed text-[var(--color-black)]">
          {ht || <span className="text-[color-mix(in_srgb,var(--color-purple)_55%,transparent)]">Not filled in yet.</span>}
        </p>
      </section>
    </div>
  )
}

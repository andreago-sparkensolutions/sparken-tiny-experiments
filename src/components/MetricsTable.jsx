import { useCallback, useEffect, useRef, useState } from 'react'
import { effectiveTargetUpperBound, formatMetricTargetDisplay } from '../lib/metricVisual'

const BORDER = {
  on_track: 'var(--color-yellow)',
  warning: 'var(--color-lime)',
  off_track: 'var(--color-danger)',
  pending: 'var(--color-lavender)',
}

const ICON_COLOR = {
  on_track: 'text-[var(--color-yellow)]',
  warning: 'text-[var(--color-lime)]',
  off_track: 'text-[var(--color-danger)]',
  pending: 'text-[var(--color-lavender)]',
}

function StatusIcon({ status, warningThreshold }) {
  const st = status && BORDER[status] ? status : 'pending'
  if (st === 'on_track') return <span className={`font-body text-lg ${ICON_COLOR[st]}`}>✓</span>
  if (st === 'warning')
    return (
      <span
        className={`inline-flex cursor-help font-body text-lg ${ICON_COLOR[st]}`}
        title={warningThreshold || 'Warning threshold'}
      >
        ⚠
      </span>
    )
  if (st === 'off_track') return <span className={`font-body text-lg ${ICON_COLOR[st]}`}>✗</span>
  return <span className={`font-body text-lg ${ICON_COLOR[st]}`}>—</span>
}

/** Inline target owner for compact metric rows (each metric saves separately). */
function MetricTargetOwnerInlineSave({ metric, onUpdateMetric }) {
  const [email, setEmail] = useState(metric.assignee_email ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setEmail(metric.assignee_email ?? '')
      setErr(null)
      setOk(false)
    })
  }, [metric.id, metric.assignee_email])

  const serverNorm = (metric.assignee_email ?? '').trim() || null
  const nextNorm = email.trim() === '' ? null : email.trim()
  const dirty = nextNorm !== serverNorm

  const save = async () => {
    if (!dirty) return
    setErr(null)
    setSaving(true)
    const { error } = (await onUpdateMetric(metric.id, { assignee_email: nextNorm })) ?? {}
    setSaving(false)
    if (error) {
      setErr(error.message ?? 'Save failed')
      return
    }
    setOk(true)
    window.setTimeout(() => setOk(false), 2000)
  }

  return (
    <div className="mt-2 border-t border-[color-mix(in_srgb,var(--color-lavender)_55%,transparent)] pt-2">
      <label className="font-metric mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-purple)]">
        Target owner (email) for this metric
      </label>
      <div className="flex flex-wrap items-stretch gap-2">
        <input
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          className="focus-sparken min-w-0 flex-1 rounded border border-[var(--color-lavender)] bg-[var(--color-white)] px-2 py-1.5 font-body text-[13px] text-[var(--color-black)]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => void save()}
          aria-label={`Target owner email for ${metric.label ?? 'metric'}`}
        />
        <button
          type="button"
          disabled={saving || !dirty}
          className="focus-sparken shrink-0 rounded border border-[var(--color-purple)] bg-[var(--color-yellow)] px-3 py-1.5 font-body text-[12px] font-semibold text-[var(--color-black)] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => void save()}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
      <p className="mt-1 m-0 font-body text-[10px] text-[color-mix(in_srgb,var(--color-purple)_58%,transparent)]">
        Saves when you click Save or leave this field. Use ✏️ to edit current value and status together.
      </p>
      {err ? <p className="mt-1 m-0 font-body text-[10px] text-[var(--color-danger)]">{err}</p> : null}
      {ok ? <p className="mt-1 m-0 font-body text-[10px] font-semibold text-emerald-800">Saved.</p> : null}
    </div>
  )
}

export function MetricFullEditRow({ metric, onUpdateMetric }) {
  const [label, setLabel] = useState(metric.label ?? '')
  const [targetUpperBound, setTargetUpperBound] = useState(() => {
    const n = effectiveTargetUpperBound(metric)
    return n != null && Number.isFinite(n) ? String(n) : ''
  })
  const [currentValue, setCurrentValue] = useState(metric.current_value ?? '')
  const [warningThreshold, setWarningThreshold] = useState(metric.warning_threshold ?? '')
  const [assigneeEmail, setAssigneeEmail] = useState(metric.assignee_email ?? '')
  const [status, setStatus] = useState(metric.status ?? 'pending')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setLabel(metric.label ?? '')
      const hint = effectiveTargetUpperBound(metric)
      setTargetUpperBound(hint != null && Number.isFinite(hint) ? String(hint) : '')
      setCurrentValue(metric.current_value ?? '')
      setWarningThreshold(metric.warning_threshold ?? '')
      setAssigneeEmail(metric.assignee_email ?? '')
      setStatus(metric.status ?? 'pending')
    })
  }, [metric])

  const st = status && BORDER[status] ? status : 'pending'

  const saveRow = async () => {
    setSaving(true)
    const ubRaw = targetUpperBound.trim().replace(/,/g, '')
    const ubNum = ubRaw === '' ? null : Number(ubRaw)
    const target_upper_bound =
      ubNum != null && Number.isFinite(ubNum) && ubNum > 0 ? ubNum : null

    const patch = {
      label: label.trim() || 'Untitled metric',
      target_upper_bound,
      current_value: currentValue.trim() === '' ? null : currentValue.trim(),
      warning_threshold: warningThreshold.trim() === '' ? null : warningThreshold.trim(),
      assignee_email: assigneeEmail.trim() === '' ? null : assigneeEmail.trim(),
      status,
    }
    if (target_upper_bound != null) patch.target_value = null
    await onUpdateMetric(metric.id, patch)
    setSaving(false)
  }

  return (
    <div
      className="rounded-sm border border-[var(--color-lavender)] bg-[var(--color-white)] p-3"
      style={{ borderLeft: `3px solid ${BORDER[st]}` }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <StatusIcon status={status} warningThreshold={warningThreshold} />
        <button
          type="button"
          disabled={saving}
          className="focus-sparken rounded-full bg-[var(--color-yellow)] px-3 py-1.5 font-body text-[12px] font-semibold text-[var(--color-black)] disabled:opacity-50"
          onClick={saveRow}
        >
          {saving ? '…' : 'Save metric'}
        </button>
      </div>
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Label</label>
      <textarea
        className="focus-sparken mb-2 min-h-[2.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
        rows={2}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Target (upper bound, one number)</label>
      <input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        placeholder="e.g. 50"
        className="focus-sparken mb-2 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
        value={targetUpperBound}
        onChange={(e) => setTargetUpperBound(e.target.value)}
      />
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Current value</label>
      <textarea
        className="focus-sparken mb-2 min-h-[4rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
        rows={3}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
      />
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Warning threshold</label>
      <textarea
        className="focus-sparken mb-2 min-h-[2.5rem] w-full resize-y rounded border border-[var(--color-lavender)] p-2 font-body text-[13px] text-[var(--color-black)]"
        rows={2}
        value={warningThreshold}
        onChange={(e) => setWarningThreshold(e.target.value)}
      />
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Target owner (email)</label>
      <input
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        className="focus-sparken mb-2 w-full rounded border border-[var(--color-lavender)] p-2 font-body text-[14px] text-[var(--color-black)]"
        value={assigneeEmail}
        onChange={(e) => setAssigneeEmail(e.target.value)}
      />
      <p className="mb-2 m-0 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--color-purple)_68%,transparent)]">
        Click <strong className="font-semibold">Save metric</strong> to persist this row (including target owner). Assignees can get an email if the Edge Function and Resend are configured (see README).
      </p>
      <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Status</label>
      <select
        className="focus-sparken w-full rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="on_track">On track</option>
        <option value="warning">Warning</option>
        <option value="off_track">Off track</option>
      </select>
    </div>
  )
}

function ReadOnlyMetricDetailCard({ metric }) {
  const st = metric.status && BORDER[metric.status] ? metric.status : 'pending'
  const display = (v) => (v == null || String(v).trim() === '' ? '—' : String(v))
  return (
    <div
      className="rounded-sm border border-[var(--color-lavender)] bg-[var(--color-white)] p-4"
      style={{ borderLeft: `3px solid ${BORDER[st]}` }}
    >
      <p className="m-0 font-body text-[14px] font-bold text-[var(--color-black)]">{metric.label ?? 'Untitled metric'}</p>
      <dl className="m-0 mt-3 grid grid-cols-1 gap-2 font-body text-[13px] sm:grid-cols-2">
        <div>
          <dt className="font-metric text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Target</dt>
          <dd className="m-0 mt-0.5 text-[var(--color-black)]">{formatMetricTargetDisplay(metric)}</dd>
        </div>
        <div>
          <dt className="font-metric text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Current</dt>
          <dd className="m-0 mt-0.5 text-[var(--color-black)]">{display(metric.current_value)}</dd>
        </div>
        <div>
          <dt className="font-metric text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Warning threshold</dt>
          <dd className="m-0 mt-0.5 text-[var(--color-black)]">{display(metric.warning_threshold)}</dd>
        </div>
        <div>
          <dt className="font-metric text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Target owner (email)</dt>
          <dd className="m-0 mt-0.5 break-all text-[var(--color-black)]">{display(metric.assignee_email)}</dd>
        </div>
        <div>
          <dt className="font-metric text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-purple)]">Status</dt>
          <dd className="m-0 mt-0.5 capitalize text-[var(--color-black)]">{(metric.status ?? 'pending').replace(/_/g, ' ')}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function MetricsTable({ metrics, canEdit, onUpdateMetric, fullColumnEdit = false, readOnlyDetail = false }) {
  const [openId, setOpenId] = useState(null)
  const [draftValue, setDraftValue] = useState('')
  const [draftAssignee, setDraftAssignee] = useState('')
  const [draftStatus, setDraftStatus] = useState('pending')
  const popoverRef = useRef(null)

  const closePopover = useCallback(() => {
    setOpenId(null)
  }, [])

  useEffect(() => {
    if (!openId) return
    const onDoc = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        closePopover()
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [openId, closePopover])

  const openFor = (m) => {
    setOpenId(m.id)
    setDraftValue(m.current_value ?? '')
    setDraftAssignee(m.assignee_email ?? '')
    setDraftStatus(m.status ?? 'pending')
  }

  const saveDraft = async (metricId) => {
    const { error } = await onUpdateMetric(metricId, {
      current_value: draftValue.trim() === '' ? null : draftValue.trim(),
      assignee_email: draftAssignee.trim() === '' ? null : draftAssignee.trim(),
      status: draftStatus,
    })
    if (!error) closePopover()
  }

  if (!metrics?.length) {
    return <p className="m-0 font-body text-[14px] text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">No metrics yet.</p>
  }

  if (fullColumnEdit && canEdit) {
    return (
      <div className="flex flex-col gap-4">
        {metrics.map((m) => (
          <MetricFullEditRow key={m.id} metric={m} onUpdateMetric={onUpdateMetric} />
        ))}
      </div>
    )
  }

  if (readOnlyDetail) {
    return (
      <div className="flex flex-col gap-4">
        {metrics.map((m) => (
          <ReadOnlyMetricDetailCard key={m.id} metric={m} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {metrics.map((m) => {
        const st = m.status && BORDER[m.status] ? m.status : 'pending'
        return (
          <div
            key={m.id}
            className="group/metric-row relative rounded-sm bg-[var(--color-white)]"
            style={{ borderLeft: `3px solid ${BORDER[st]}` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 pl-[18px]">
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-[13px] font-semibold text-[var(--color-black)]">{m.label}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {m.current_value == null || m.current_value === '' ? (
                    <span className="font-body text-[18px] font-semibold italic text-[var(--color-lavender)]">
                      — No data
                    </span>
                  ) : (
                    <span className="font-body text-[18px] font-semibold text-[var(--color-black)]">{m.current_value}</span>
                  )}
                  {formatMetricTargetDisplay(m) !== '—' ? (
                    <span className="font-body text-[12px] text-[color-mix(in_srgb,var(--color-purple)_60%,transparent)]">
                      vs target: {formatMetricTargetDisplay(m)}
                    </span>
                  ) : null}
                  {!canEdit ? (
                    <span className="w-full font-body text-[11px] text-[color-mix(in_srgb,var(--color-purple)_75%,transparent)]">
                      Target owner (email): {m.assignee_email?.trim() || '—'}
                    </span>
                  ) : null}
                </div>
                {canEdit && onUpdateMetric ? <MetricTargetOwnerInlineSave metric={m} onUpdateMetric={onUpdateMetric} /> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusIcon status={m.status} warningThreshold={m.warning_threshold} />
                {canEdit ? (
                  <button
                    type="button"
                    className="group/metric-edit rounded p-1 text-[var(--color-purple)] opacity-100 transition-opacity hover:bg-[color-mix(in_srgb,var(--color-lavender)_35%,transparent)] focus:opacity-100 focus-sparken sm:opacity-0 sm:group-hover/metric-row:opacity-100"
                    aria-label="Quick edit metric"
                    onClick={() => openFor(m)}
                  >
                    <span aria-hidden>✏️</span>
                  </button>
                ) : null}
              </div>
            </div>

            {canEdit && openId === m.id ? (
              <div
                ref={popoverRef}
                className="absolute right-2 top-full z-30 mt-2 w-[min(100%,20rem)] rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-3 shadow-[0_8px_24px_rgba(3,4,3,0.12)]"
              >
                <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Current value</label>
                <textarea
                  className="focus-sparken mb-3 min-h-[120px] w-full resize-y rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  rows={4}
                />
                <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Target owner (email)</label>
                <input
                  type="email"
                  className="focus-sparken mb-3 w-full rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
                  value={draftAssignee}
                  onChange={(e) => setDraftAssignee(e.target.value)}
                  placeholder="assignee@company.com"
                />
                <label className="font-sparken-label mb-1 block text-[var(--color-purple)]">Status</label>
                <select
                  className="focus-sparken mb-3 w-full rounded border border-[var(--color-lavender)] bg-[var(--color-white)] p-2 font-body text-[14px] text-[var(--color-black)]"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="on_track">On track</option>
                  <option value="warning">Warning</option>
                  <option value="off_track">Off track</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="focus-sparken flex-1 rounded-full bg-[var(--color-yellow)] px-3 py-2 font-body text-[14px] font-semibold text-[var(--color-black)]"
                    onClick={() => saveDraft(m.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="focus-sparken rounded-full px-3 py-2 font-body text-[14px] font-semibold text-[var(--color-purple)]"
                    onClick={closePopover}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { NEW_EXPERIMENT_HYPOTHESIZED_TARGET_NOTE, NEW_EXPERIMENT_RESEARCH_BASIS } from './defaultNewExperimentCopy'
import { normalizeAssigneeEmail, notifyMetricAssigneeIfConfigured } from './notifyMetricAssignee'
import { parseOptionalPositiveTargetUpperBound } from './metricVisual'
import { supabase, supabaseConfigured } from './supabase'

function findMetricContext(experiments, metricId) {
  for (const exp of experiments ?? []) {
    const m = exp.metrics?.find((x) => x.id === metricId)
    if (m) return { experiment: exp, metric: m }
  }
  return { experiment: null, metric: null }
}

function sortMetrics(metrics) {
  if (!metrics?.length) return []
  return [...metrics].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export function useExperiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExperiments = useCallback(async () => {
    if (!supabaseConfigured) {
      setExperiments([])
      setLoading(false)
      setError(new Error('Supabase is not configured'))
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: qError } = await supabase
      .from('experiments')
      .select('*, metrics(*)')
      .order('created_at', { ascending: true })

    if (qError) {
      setError(qError)
      setExperiments([])
    } else {
      const rows = (data ?? []).map((exp) => ({
        ...exp,
        metrics: sortMetrics(exp.metrics),
      }))
      setExperiments(rows)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      fetchExperiments()
    })
  }, [fetchExperiments])

  const updateMetric = useCallback(
    async (metricId, patch) => {
      const { experiment, metric } = findMetricContext(experiments, metricId)
      const prevAssigneeNorm = normalizeAssigneeEmail(metric?.assignee_email)

      const { error: uError } = await supabase.from('metrics').update(patch).eq('id', metricId)
      if (uError) return { error: uError }
      await fetchExperiments()

      const nextRaw = Object.prototype.hasOwnProperty.call(patch, 'assignee_email')
        ? patch.assignee_email == null || String(patch.assignee_email).trim() === ''
          ? null
          : String(patch.assignee_email).trim()
        : metric?.assignee_email ?? null
      const nextNorm = normalizeAssigneeEmail(nextRaw)
      if (nextRaw && nextNorm !== prevAssigneeNorm) {
        const label =
          patch.label !== undefined ? String(patch.label ?? '').trim() || metric?.label || 'Metric' : metric?.label ?? 'Metric'
        await notifyMetricAssigneeIfConfigured({
          assigneeEmail: nextRaw,
          experimentTitle: experiment?.title ?? 'Experiment',
          metricLabel: label,
          metricId,
        })
      }

      return { error: null }
    },
    [experiments, fetchExperiments]
  )

  const updateExperiment = useCallback(
    async (experimentId, patch) => {
      const { error: uError } = await supabase
        .from('experiments')
        .update(patch)
        .eq('id', experimentId)
      if (!uError) await fetchExperiments()
      return { error: uError }
    },
    [fetchExperiments]
  )

  const createExperiment = useCallback(async () => {
    const payload = {
      title: 'New experiment',
      emoji: '📋',
      status: 'on_deck',
      category: 'General',
      observation: '',
      question: '',
      hypothesis: '',
      experiment_description: '',
      research_basis: NEW_EXPERIMENT_RESEARCH_BASIS,
      hypothesized_target_note: NEW_EXPERIMENT_HYPOTHESIZED_TARGET_NOTE,
      target_owner_email: null,
    }
    const { data, error: cError } = await supabase.from('experiments').insert(payload).select('id').single()
    if (!cError) await fetchExperiments()
    return { data, error: cError }
  }, [fetchExperiments])

  /**
   * @param {string} experimentId
   * @param {object} experimentFields — text/status fields
   * @param {{ id?: string, _delete?: boolean }[]} metricsForm — rows from EditPanel
   */
  const saveExperimentWithMetrics = useCallback(
    async (experimentId, experimentFields, metricsForm) => {
      const prevByMetricId = new Map()
      for (const exp of experiments) {
        if (exp.id !== experimentId) continue
        for (const m of exp.metrics ?? []) {
          prevByMetricId.set(m.id, m.assignee_email ?? null)
        }
      }

      const { error: expError } = await supabase
        .from('experiments')
        .update(experimentFields)
        .eq('id', experimentId)
      if (expError) return { error: expError }

      const expTitle =
        (experimentFields.title && String(experimentFields.title).trim()) ||
        experiments.find((e) => e.id === experimentId)?.title ||
        'Experiment'

      for (const row of metricsForm) {
        if (row._delete && row.id) {
          const { error: dError } = await supabase.from('metrics').delete().eq('id', row.id)
          if (dError) return { error: dError }
          continue
        }
        if (row._delete) continue

        const assigneeRaw = row.assignee_email?.trim() ? String(row.assignee_email).trim() : null
        const targetUpper = parseOptionalPositiveTargetUpperBound(row.target_upper_bound)
        const payload = {
          label: row.label ?? '',
          target_upper_bound: targetUpper,
          current_value: row.current_value || null,
          warning_threshold: row.warning_threshold || null,
          status: row.status ?? 'pending',
          sort_order: row.sort_order ?? 0,
          assignee_email: assigneeRaw,
        }
        if (targetUpper != null) payload.target_value = null

        if (row.id) {
          const prevNorm = normalizeAssigneeEmail(prevByMetricId.get(row.id))
          const { error: uError } = await supabase.from('metrics').update(payload).eq('id', row.id)
          if (uError) return { error: uError }
          const nextNorm = normalizeAssigneeEmail(assigneeRaw)
          if (assigneeRaw && nextNorm !== prevNorm) {
            await notifyMetricAssigneeIfConfigured({
              assigneeEmail: assigneeRaw,
              experimentTitle: expTitle,
              metricLabel: row.label?.trim() || 'Metric',
              metricId: row.id,
            })
          }
        } else {
          const { data: inserted, error: iError } = await supabase
            .from('metrics')
            .insert({
              experiment_id: experimentId,
              ...payload,
            })
            .select('id')
            .single()
          if (iError) return { error: iError }
          if (assigneeRaw && inserted?.id) {
            await notifyMetricAssigneeIfConfigured({
              assigneeEmail: assigneeRaw,
              experimentTitle: expTitle,
              metricLabel: row.label?.trim() || 'Metric',
              metricId: inserted.id,
            })
          }
        }
      }

      await fetchExperiments()
      return { error: null }
    },
    [experiments, fetchExperiments]
  )

  return {
    experiments,
    loading,
    error,
    refetch: fetchExperiments,
    updateMetric,
    updateExperiment,
    createExperiment,
    saveExperimentWithMetrics,
  }
}

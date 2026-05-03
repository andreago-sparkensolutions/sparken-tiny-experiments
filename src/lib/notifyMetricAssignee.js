import { supabase, supabaseConfigured } from './supabase'

/**
 * Ask the Edge Function to email the assignee when a metric is assigned to them.
 * No-ops if Supabase is not configured or the function is not deployed.
 *
 * @param {{
 *   assigneeEmail: string,
 *   experimentTitle: string,
 *   metricLabel: string,
 *   metricId: string,
 * }} payload
 */
export async function notifyMetricAssigneeIfConfigured(payload) {
  if (!supabaseConfigured) return { skipped: true }
  const email = String(payload.assigneeEmail ?? '').trim()
  if (!email || !email.includes('@')) return { skipped: true }

  try {
    const { data, error } = await supabase.functions.invoke('notify-metric-assignee', {
      body: {
        assigneeEmail: email,
        experimentTitle: payload.experimentTitle ?? 'Experiment',
        metricLabel: payload.metricLabel ?? 'Metric',
        metricId: payload.metricId,
      },
    })
    return { data, error }
  } catch (e) {
    console.warn('[Sparken] notify-metric-assignee invoke failed:', e)
    return { error: e, skipped: true }
  }
}

/** @param {string | null | undefined} e */
export function normalizeAssigneeEmail(e) {
  if (e == null || String(e).trim() === '') return null
  return String(e).trim().toLowerCase()
}

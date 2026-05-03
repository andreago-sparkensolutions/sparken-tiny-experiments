// Deno runtime — deploy: `supabase functions deploy notify-metric-assignee`
// Secrets: RESEND_API_KEY (optional). Set FROM_EMAIL if you use a verified domain.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: {
    assigneeEmail?: string
    experimentTitle?: string
    metricLabel?: string
    metricId?: string
  }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const assigneeEmail = String(body.assigneeEmail ?? '').trim()
  const experimentTitle = String(body.experimentTitle ?? 'Experiment').trim() || 'Experiment'
  const metricLabel = String(body.metricLabel ?? 'Metric').trim() || 'Metric'
  const metricId = body.metricId ?? ''

  if (!assigneeEmail || !assigneeEmail.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid assignee email' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'Sparken <onboarding@resend.dev>'
  const assigner = user.email ?? 'A teammate'

  if (!resendKey) {
    return new Response(
      JSON.stringify({
        sent: false,
        message: 'RESEND_API_KEY is not set on the Edge Function. Assignment is saved; configure Resend to send email.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const subject = `You were assigned a metric: ${metricLabel}`
  const html = `
    <p>Hi,</p>
    <p><strong>${assigner}</strong> assigned you to own this metric in Sparken — Tiny Experiments.</p>
    <ul>
      <li><strong>Experiment:</strong> ${escapeHtml(experimentTitle)}</li>
      <li><strong>Metric:</strong> ${escapeHtml(metricLabel)}</li>
      ${metricId ? `<li><strong>Metric id:</strong> ${escapeHtml(metricId)}</li>` : ''}
    </ul>
    <p>Open the Sparken dashboard to view targets and log updates.</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [assigneeEmail],
      subject,
      html,
    }),
  })

  const resJson = await res.json().catch(() => ({}))
  if (!res.ok) {
    return new Response(JSON.stringify({ sent: false, error: resJson }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ sent: true, id: resJson.id }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

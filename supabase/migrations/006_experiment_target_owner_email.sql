-- Program-level target owner (email), distinct from per-metric assignee_email.

ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS target_owner_email text;

COMMENT ON COLUMN public.experiments.target_owner_email IS 'Accountable owner (email) for this experiment’s targets overall; metrics may also list per-KPI target owner emails.';

UPDATE public.experiments SET target_owner_email = 'rose@sparken.example'
WHERE id IN (
  'f0000001-0000-4000-8000-000000000001',
  'f0000002-0000-4000-8000-000000000002',
  'f0000003-0000-4000-8000-000000000003'
);

UPDATE public.experiments SET target_owner_email = 'andrea@sparken.example'
WHERE id IN (
  'f0000004-0000-4000-8000-000000000004',
  'f0000005-0000-4000-8000-000000000005'
);

UPDATE public.metrics SET assignee_email = 'rose@sparken.example'
WHERE experiment_id IN (
  'f0000001-0000-4000-8000-000000000001',
  'f0000002-0000-4000-8000-000000000002',
  'f0000003-0000-4000-8000-000000000003'
);

UPDATE public.metrics SET assignee_email = 'andrea@sparken.example'
WHERE experiment_id IN (
  'f0000004-0000-4000-8000-000000000004',
  'f0000005-0000-4000-8000-000000000005'
);

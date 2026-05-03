-- Metric owner / assignee (email). Used for accountability and optional email notifications.

ALTER TABLE public.metrics
  ADD COLUMN IF NOT EXISTS assignee_email text;

COMMENT ON COLUMN public.metrics.assignee_email IS 'Person responsible for this metric; optional email for assignment notifications.';

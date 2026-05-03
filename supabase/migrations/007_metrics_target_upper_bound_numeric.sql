-- Single numeric source of truth for each metric’s hypothesized target (upper bound).
-- Clears legacy free-text target_value for seeded rows so the UI only reads target_upper_bound.

ALTER TABLE public.metrics
  ADD COLUMN IF NOT EXISTS target_upper_bound double precision;

COMMENT ON COLUMN public.metrics.target_upper_bound IS 'Hypothesized target as one positive number (upper bound). Canonical for display and progress; target_value is legacy text.';

UPDATE public.metrics SET target_upper_bound = 5, target_value = NULL WHERE id = 'f1000001-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_upper_bound = 2, target_value = NULL WHERE id = 'f1000001-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_upper_bound = 20, target_value = NULL WHERE id = 'f1000001-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_upper_bound = 100, target_value = NULL WHERE id = 'f1000001-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_upper_bound = 50, target_value = NULL WHERE id = 'f1000002-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_upper_bound = 20, target_value = NULL WHERE id = 'f1000002-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_upper_bound = 10, target_value = NULL WHERE id = 'f1000002-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_upper_bound = 1, target_value = NULL WHERE id = 'f1000002-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_upper_bound = 30, target_value = NULL WHERE id = 'f1000003-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_upper_bound = 40, target_value = NULL WHERE id = 'f1000003-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_upper_bound = 2, target_value = NULL WHERE id = 'f1000003-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_upper_bound = 10, target_value = NULL WHERE id = 'f1000003-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_upper_bound = 7, target_value = NULL WHERE id = 'f1000004-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_upper_bound = 30, target_value = NULL WHERE id = 'f1000004-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_upper_bound = 15, target_value = NULL WHERE id = 'f1000004-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_upper_bound = 10, target_value = NULL WHERE id = 'f1000004-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_upper_bound = 35, target_value = NULL WHERE id = 'f1000005-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_upper_bound = 7, target_value = NULL WHERE id = 'f1000005-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_upper_bound = 20, target_value = NULL WHERE id = 'f1000005-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_upper_bound = 3000, target_value = NULL WHERE id = 'f1000005-0000-4000-8000-000000000004';

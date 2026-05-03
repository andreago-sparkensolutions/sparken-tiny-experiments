-- Sparken Tiny Experiments — initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  emoji text,
  status text NOT NULL DEFAULT 'on_deck'
    CHECK (status IN ('running', 'on_deck', 'complete', 'stopped')),
  category text,
  observation text,
  question text,
  hypothesis text,
  experiment_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments (id) ON DELETE CASCADE,
  label text NOT NULL,
  target_value text,
  current_value text,
  warning_threshold text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('on_track', 'warning', 'off_track', 'pending')),
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX metrics_experiment_id_sort_idx ON public.metrics (experiment_id, sort_order);

CREATE OR REPLACE FUNCTION public.handle_experiments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER experiments_set_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_experiments_updated_at();

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated)
CREATE POLICY experiments_select_public
  ON public.experiments
  FOR SELECT
  USING (true);

CREATE POLICY metrics_select_public
  ON public.metrics
  FOR SELECT
  USING (true);

-- Authenticated writes
CREATE POLICY experiments_insert_authenticated
  ON public.experiments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY experiments_update_authenticated
  ON public.experiments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY experiments_delete_authenticated
  ON public.experiments
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY metrics_insert_authenticated
  ON public.metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY metrics_update_authenticated
  ON public.metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY metrics_delete_authenticated
  ON public.metrics
  FOR DELETE
  TO authenticated
  USING (true);

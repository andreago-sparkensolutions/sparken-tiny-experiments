# Supabase — **sparken-tiny-experiments**

CLI commands must be run from the **repository root** (the directory that contains `package.json` and this `supabase/` folder).

## Link this repo to **your** Supabase project

There is **no** project ref stored in git. The ref is whatever project you already use with the app:

1. Open the same Supabase project as in your root **`.env`**:
   - `VITE_SUPABASE_URL` → e.g. `https://<project-ref>.supabase.co`
   - The **`project-ref`** segment in that URL is what you pass to the CLI.

2. Or copy **Reference ID** from: **Supabase Dashboard → Project Settings → General**.

3. From the repo root:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   Use the **database password** for that project when prompted.

After a successful link, `supabase db push` (and other remote commands) apply to **that** project only.

## Migrations in **this** project

Run in order (CLI does this automatically with `db push`):

| File | Purpose |
|------|--------|
| `migrations/001_init.sql` | Core `experiments` / `metrics`, RLS, trigger |
| `migrations/002_metric_assignee_email.sql` | `metrics.assignee_email` |
| `migrations/003_experiment_research_and_metric_targets.sql` | Research / target text columns |
| `migrations/004_metric_targets_upper_bound.sql` | Target copy updates |
| `migrations/005_prefill_research_hypothesis_upperbound.sql` | Seed-style copy |
| `migrations/006_experiment_target_owner_email.sql` | **`experiments.target_owner_email`** |

Optional seed: `seed.sql` (after migrations).

## Without the CLI

Use **SQL Editor** in the same dashboard project and paste each migration file in order, then `seed.sql` if you want sample data.

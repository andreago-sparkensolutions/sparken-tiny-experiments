# Sparken — Tiny Experiments Dashboard

Internal mission-control dashboard for Sparken experiments and metrics. Built with **React + Vite + Tailwind CSS** and **Supabase** (PostgreSQL, Auth, Row Level Security). There is no separate backend: the browser uses the Supabase JS client with your anon key and RLS policies.

## Prerequisites

- Node.js 20+ (recommended)
- A [Supabase](https://supabase.com) project

## Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set:

- `VITE_SUPABASE_URL` — Project URL (Settings → API)
- `VITE_SUPABASE_ANON_KEY` — `anon` `public` key (Settings → API)

Run the dev server:

```bash
npm run dev
```

The app is served at **http://localhost:3001/** by default (see `vite.config.js`). If that port is busy, Vite picks the next free port and prints it in the terminal.

### Creating your account (sign-in)

This app does **not** include a public sign-up form. An admin creates users in Supabase:

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication → Users**.
3. Click **Add user** → **Create new user**, and set the email and password you want.
4. In the app, click **Login** (top right) and sign in with that email and password.

Add **http://localhost:3001** (and your production URL when you deploy) under **Authentication → URL Configuration** if Supabase asks for site or redirect URLs.

Production build:

```bash
npm run build
npm run preview
```

### Deploying on Vercel

1. Import this GitHub repo, framework **Vite**, root **`./`**.
2. In **Settings → Environment Variables**, add **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** for **Production** (and Preview if you use it). Redeploy after saving — Vite bakes these in at **build** time.
3. **Blank page after deploy** (dark background, no UI): open DevTools → **Network** → reload. If `/assets/*.js` returns **200 but type document/HTML** instead of JavaScript, a bad SPA rewrite was intercepting assets — this repo intentionally **does not** ship a catch‑all `vercel.json` rewrite for that reason. If the script **404s**, check the deployment output root. If the script loads but the page is blank, check the **Console** for errors (and confirm env vars were present at build time).

## Supabase project setup

1. Create a new project in the Supabase dashboard.
2. Open **SQL Editor** (or use the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to this project).

### Supabase CLI: login and link (fixes “Cannot find project ref”)

**Project-specific steps** (this repo, your `.env` URL, and migration list): see **[`supabase/README.md`](supabase/README.md)**.

Commands like `supabase db push` need a **linked** remote project. From the **repo root** (where `supabase/config.toml` is):

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if needed.
2. Log in: `supabase login` (browser flow).
3. Link this folder to your hosted project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   **Project ref:** Dashboard → **Project Settings** → **General** → **Reference ID** (lowercase alphanumeric string).

If you see **“Cannot find project ref. Have you run supabase link?”**, run step 3 from this directory, or you ran the CLI outside the repo. This repo includes `supabase/config.toml` from `supabase init`; linking is still required once per checkout.

### Run the schema migrations

Apply **every** file under [`supabase/migrations/`](supabase/migrations/) **in numeric order** (`001` → `006`). Together they create and extend:

- `experiments` and `metrics` (001), plus later columns such as `metrics.assignee_email` (002) and **`experiments.target_owner_email` (006 — program-level target owner)**
- A trigger to keep `experiments.updated_at` current on every update
- Row Level Security: **anyone can read** (anon + authenticated); **only authenticated users** can insert, update, or delete

**Using the CLI** (after `supabase link`; from this repo):

```bash
supabase db push
# or, for local Supabase + fresh DB + seed:
supabase db reset
```

**Using the dashboard:** open **SQL Editor**, then run each migration file in order (`001_init.sql` through `006_experiment_target_owner_email.sql`), or paste them one after another in a single script.

#### “Could not find the `target_owner_email` column of `experiments`”

The app expects migration **006**. If you set up the database before that existed, run [`supabase/migrations/006_experiment_target_owner_email.sql`](supabase/migrations/006_experiment_target_owner_email.sql) in the SQL Editor (safe to re-run: it uses `ADD COLUMN IF NOT EXISTS`). After that, reload the app and save again.

### Metric owner + assignment email (optional)

Each metric can have an **assignee email** (owner). When a signed-in user **saves** a new or changed assignee, the app calls the Edge Function **`notify-metric-assignee`**, which can send mail via [Resend](https://resend.com).

1. Apply migration `002_metric_assignee_email.sql`.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), link your project, then deploy:
   ```bash
   supabase functions deploy notify-metric-assignee
   ```
   The browser sends the signed-in user’s JWT; the function checks `auth.getUser()` before sending mail.
3. In the Supabase dashboard → **Edge Functions** → **notify-metric-assignee** → **Secrets**, set:
   - `RESEND_API_KEY` — your Resend API key (emails are skipped until this is set).
   - Optionally `FROM_EMAIL` — e.g. `Sparken <reports@yourdomain.com>` (must be a verified sender in Resend; otherwise Resend’s test `onboarding@resend.dev` default applies).

If the function is missing or Resend is not configured, assignments still **save**; the function returns a friendly JSON message instead of sending.

### Seed data

Run the SQL in [`supabase/seed.sql`](supabase/seed.sql) in the SQL Editor (or include it in your local reset workflow). Seeds five experiments and twenty metrics; all `current_value` values are `NULL` and metric statuses are `pending`.

## Admin user (Supabase Auth)

This app expects a **single admin** account (email + password). Supabase does not create users from the migration files here.

1. In the Supabase dashboard, go to **Authentication → Users**.
2. Click **Add user** → **Create new user**.
3. Enter Andrea’s email and password (or use **Invite** if you prefer email flow).
4. Sign in through the app’s **Login** button with those credentials.

Only authenticated sessions receive write access via RLS; unauthenticated visitors can still **view** the dashboard (public read).

## Brand and styling

Sparken colors and fonts are driven by CSS custom properties in [`src/index.css`](src/index.css). Prefer `var(--color-*)` or the documented utilities—avoid generic greys and default Tailwind blues so the UI stays on-brand.

Optional **H0THOUSE BOLD** and **Aileron** fonts: add WOFF2 files under `public/fonts/` and add matching `@font-face` rules in `src/index.css` (see comment there). Until then, **Black Han Sans** and **DM Sans** load from Google Fonts as fallbacks.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Vite dev server          |
| `npm run build` | Production bundle        |
| `npm run preview` | Preview production build |
| `npm run lint`  | ESLint                   |

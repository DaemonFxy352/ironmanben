# Supabase Race-Day Setup

This app uses Supabase directly from the browser for temporary public race-day coordination. There is no login, API route, or backend server in this repo.

## 1. Create Tables and Policies

Run the SQL files in `supabase/migrations/` in order in the Supabase SQL editor.

The migration creates:

- `check_ins`
- `race_updates`
- public anonymous `select` and `insert` policies
- realtime publication entries for both tables
- the `help` update type used by the "Need Help" quick update

## 2. Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

Use the same values in Vercel Project Settings under Environment Variables.

## 3. Vercel Deployment

Use these settings:

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: leave blank
- Install Command: leave blank unless you need a custom command

## 4. Realtime Behavior

The browser loads recent rows from `check_ins` and `race_updates`, then subscribes to Supabase Realtime `postgres_changes` insert events for each table. New check-ins and updates are rendered optimistically immediately, then reconciled when Supabase confirms the inserted row.

## 5. Race-Day Security Model

This is intentionally public and temporary:

- Anyone with the URL can read check-ins and updates.
- Anyone with the URL can post check-ins and updates.
- Deletes and updates are not granted to the public anonymous role.

Do not use this for private medical, child-location, or sensitive security information.

## 6. Reset or Disable After Race Day

To clear event data:

```sql
truncate table public.check_ins, public.race_updates;
```

To stop new public posts while preserving read access:

```sql
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;
```

To fully shut down public access:

```sql
drop policy if exists "Public race-day check-ins are readable" on public.check_ins;
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are readable" on public.race_updates;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;
```

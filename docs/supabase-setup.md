# Supabase Race-Day Setup

This app uses Supabase directly from the browser for temporary race-day coordination. Phone OTP login is handled by Supabase Auth; there is no API route or backend server in this repo.

## 1. Create Tables and Policies

Run the SQL files in `supabase/migrations/` in order in the Supabase SQL editor.

The migration creates:

- `check_ins`
- `race_updates`
- `messages`
- public anonymous `select` and `insert` policies
- authenticated `select` and `insert` policies for phone OTP users
- realtime publication entries for check-ins and race updates
- the `help` update type used by the "Need Help" quick update
- Quick Sync broadcast storage in the `messages` table

Enable Supabase Auth phone login in the Supabase dashboard and configure an SMS provider before race day.

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

The browser loads recent rows from `check_ins`, `race_updates`, and `messages`, then subscribes to Supabase Realtime `postgres_changes` insert events for check-ins and race updates. Quick Sync meetup calls insert a `messages` row and also use Supabase Broadcast so active users see a toast immediately.

## 5. Race-Day Security Model

This is intentionally public and temporary:

- Phone-authenticated users can read and post check-ins, updates, and Quick Sync messages.
- Anonymous access remains available in the policies for pre-race setup and fallback use.
- Deletes and updates are not granted to the public anonymous role.

Do not use this for private medical, child-location, or sensitive security information.

## 6. Reset or Disable After Race Day

To clear event data:

```sql
truncate table public.check_ins, public.race_updates, public.messages;
```

To stop new public posts while preserving read access:

```sql
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;
drop policy if exists "Race-day messages are insertable" on public.messages;
```

To fully shut down public access:

```sql
drop policy if exists "Public race-day check-ins are readable" on public.check_ins;
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are readable" on public.race_updates;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;
drop policy if exists "Race-day messages are readable" on public.messages;
drop policy if exists "Race-day messages are insertable" on public.messages;
```

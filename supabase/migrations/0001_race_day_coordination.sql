create extension if not exists pgcrypto;

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  note text null check (note is null or char_length(note) <= 180),
  lat numeric not null check (lat between -90 and 90),
  lng numeric not null check (lng between -180 and 180),
  created_at timestamptz not null default now(),
  source text not null check (source in ('gps', 'manual'))
);

create index if not exists check_ins_created_at_idx on public.check_ins (created_at desc);

create table if not exists public.race_updates (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(trim(author)) between 1 and 80),
  message text not null check (char_length(trim(message)) between 1 and 220),
  location text null check (location is null or char_length(location) <= 100),
  type text not null default 'general' check (type in ('general', 'ben', 'parking', 'food', 'meetup')),
  created_at timestamptz not null default now()
);

create index if not exists race_updates_created_at_idx on public.race_updates (created_at desc);

alter table public.check_ins enable row level security;
alter table public.race_updates enable row level security;

drop policy if exists "Public race-day check-ins are readable" on public.check_ins;
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are readable" on public.race_updates;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;

create policy "Public race-day check-ins are readable"
on public.check_ins
for select
to anon
using (true);

create policy "Public race-day check-ins are insertable"
on public.check_ins
for insert
to anon
with check (
  char_length(trim(name)) between 1 and 80
  and lat between -90 and 90
  and lng between -180 and 180
  and source in ('gps', 'manual')
);

create policy "Public race-day updates are readable"
on public.race_updates
for select
to anon
using (true);

create policy "Public race-day updates are insertable"
on public.race_updates
for insert
to anon
with check (
  char_length(trim(author)) between 1 and 80
  and char_length(trim(message)) between 1 and 220
  and type in ('general', 'ben', 'parking', 'food', 'meetup')
);

grant usage on schema public to anon;
grant select, insert on public.check_ins to anon;
grant select, insert on public.race_updates to anon;

do $$
begin
  alter publication supabase_realtime add table public.check_ins;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.race_updates;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

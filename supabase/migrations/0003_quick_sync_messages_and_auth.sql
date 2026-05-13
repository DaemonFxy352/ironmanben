create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(trim(author)) between 1 and 80),
  message text not null check (char_length(trim(message)) between 1 and 220),
  location text null check (location is null or char_length(location) <= 100),
  kind text not null check (kind in ('finish', 'memorial_park', 'lunch', 'help_water')),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Race-day messages are readable" on public.messages;
drop policy if exists "Race-day messages are insertable" on public.messages;

create policy "Race-day messages are readable"
on public.messages
for select
to anon, authenticated
using (true);

create policy "Race-day messages are insertable"
on public.messages
for insert
to anon, authenticated
with check (
  char_length(trim(author)) between 1 and 80
  and char_length(trim(message)) between 1 and 220
  and kind in ('finish', 'memorial_park', 'lunch', 'help_water')
);

drop policy if exists "Public race-day check-ins are readable" on public.check_ins;
drop policy if exists "Public race-day check-ins are insertable" on public.check_ins;
drop policy if exists "Public race-day updates are readable" on public.race_updates;
drop policy if exists "Public race-day updates are insertable" on public.race_updates;

create policy "Public race-day check-ins are readable"
on public.check_ins
for select
to anon, authenticated
using (true);

create policy "Public race-day check-ins are insertable"
on public.check_ins
for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 1 and 80
  and lat between -90 and 90
  and lng between -180 and 180
  and source in ('gps', 'manual')
);

create policy "Public race-day updates are readable"
on public.race_updates
for select
to anon, authenticated
using (true);

create policy "Public race-day updates are insertable"
on public.race_updates
for insert
to anon, authenticated
with check (
  char_length(trim(author)) between 1 and 80
  and char_length(trim(message)) between 1 and 220
  and type in ('general', 'ben', 'parking', 'food', 'meetup', 'help')
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.check_ins to anon, authenticated;
grant select, insert on public.race_updates to anon, authenticated;
grant select, insert on public.messages to anon, authenticated;

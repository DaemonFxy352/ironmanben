create table if not exists public.sms_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  recipient_count integer not null default 1,
  message_type text not null default 'general',
  status text not null default 'sent',
  textlocal_batch_id bigint,
  constraint message_type_check check (
    message_type in ('sighting', 'checkin', 'meetup', 'finish', 'general', 'auth')
  )
);

alter table public.sms_log enable row level security;

create table if not exists public.notification_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  phone_e164 text not null unique,
  display_name text not null,
  notify_sightings boolean default true,
  notify_meetup boolean default true,
  notify_finish boolean default true,
  notify_crew boolean default false,
  is_active boolean default true,
  last_notified_at timestamptz
);

alter table public.notification_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.notification_subscribers;
drop policy if exists "Read own subscription" on public.notification_subscribers;
drop policy if exists "Update own subscription" on public.notification_subscribers;

create policy "Anyone can subscribe"
on public.notification_subscribers
for insert
to anon, authenticated
with check (true);

create policy "Read own subscription"
on public.notification_subscribers
for select
to anon, authenticated
using (true);

create policy "Update own subscription"
on public.notification_subscribers
for update
to anon, authenticated
using (true);

create index if not exists idx_subscribers_phone
on public.notification_subscribers(phone_e164);

create index if not exists idx_subscribers_active
on public.notification_subscribers(is_active)
where is_active = true;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'race_updates'
      and column_name = 'author_phone'
  ) then
    alter table public.race_updates add column author_phone text;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'check_ins'
      and column_name = 'author_phone'
  ) then
    alter table public.check_ins add column author_phone text;
  end if;
end $$;

create or replace function public.get_subscriber_phones(notification_type text)
returns table(phone_e164 text, display_name text)
language sql
security definer
as $$
  select phone_e164, display_name
  from public.notification_subscribers
  where is_active = true
    and case
      when notification_type = 'sighting' then notify_sightings
      when notification_type = 'meetup' then notify_meetup
      when notification_type = 'finish' then notify_finish
      when notification_type = 'crew' then notify_crew
      else true
    end = true;
$$;

grant select, insert, update on public.notification_subscribers to anon, authenticated;
grant execute on function public.get_subscriber_phones(text) to anon, authenticated;

alter table public.race_updates
drop constraint if exists race_updates_type_check;

alter table public.race_updates
drop constraint if exists race_updates_type_allowed;

alter table public.race_updates
add constraint race_updates_type_allowed
check (type in ('ben', 'parking', 'food', 'meetup', 'help', 'general'));

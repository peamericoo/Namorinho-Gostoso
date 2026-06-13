alter table public.trips
  add column if not exists trip_kind text not null default 'visit';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trips_trip_kind_check'
      and conrelid = 'public.trips'::regclass
  ) then
    alter table public.trips
      add constraint trips_trip_kind_check
      check (trip_kind in ('visit', 'shared_destination'));
  end if;
end $$;

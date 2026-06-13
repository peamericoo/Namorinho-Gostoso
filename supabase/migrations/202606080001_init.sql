create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  display_name text not null,
  avatar_url text,
  person_key text not null check (person_key in ('pedro', 'camilly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  default_currency text not null default 'BRL',
  default_split_pedro numeric(5,2) not null default 50 check (default_split_pedro >= 0 and default_split_pedro <= 100),
  default_split_camilly numeric(5,2) not null default 50 check (default_split_camilly >= 0 and default_split_camilly <= 100),
  monthly_budget_pedro numeric(12,2) not null default 0,
  monthly_budget_camilly numeric(12,2) not null default 0,
  monthly_budget_shared numeric(12,2) not null default 0,
  emergency_reserve_percent numeric(5,2) not null default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint couples_split_total check (round(default_split_pedro + default_split_camilly, 2) = 100)
);

create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'membro' check (role in ('admin', 'membro')),
  person_key text not null check (person_key in ('pedro', 'camilly')),
  created_at timestamptz not null default now(),
  unique (couple_id, user_id),
  unique (couple_id, person_key)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  traveler_person text not null check (traveler_person in ('pedro', 'camilly')),
  host_person text not null check (host_person in ('pedro', 'camilly')),
  trip_kind text not null default 'visit' check (trip_kind in ('visit', 'shared_destination')),
  direction text not null,
  origin_city text not null,
  destination_city text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'planejada',
  purpose text,
  planned_budget numeric(12,2) not null default 0,
  priority text not null default 'media',
  tickets_url text,
  accommodation_url text,
  itinerary_url text,
  ticket_deadline date,
  accommodation_deadline date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_dates check (end_date >= start_date),
  constraint trips_budget check (planned_budget >= 0)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples(id) on delete cascade,
  name text not null,
  type text not null default 'expense',
  icon text not null default 'tag',
  color text not null default '#6C63B7',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (couple_id, name)
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (category_id, name)
);

create table public.planned_expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  owner_person text not null check (owner_person in ('pedro', 'camilly')),
  expected_date date,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  cost_type text not null default 'variavel',
  description text not null,
  planned_amount numeric(12,2) not null check (planned_amount >= 0),
  min_amount numeric(12,2) default 0 check (min_amount >= 0),
  max_amount numeric(12,2) default 0 check (max_amount >= 0),
  probability numeric(5,2) not null default 100 check (probability >= 0 and probability <= 100),
  is_required boolean not null default true,
  paid_by_person text not null check (paid_by_person in ('pedro', 'camilly', 'ambos')),
  beneficiary_person text not null check (beneficiary_person in ('pedro', 'camilly', 'ambos')),
  payment_method text,
  is_installment boolean not null default false,
  installment_count integer not null default 1 check (installment_count > 0),
  status text not null default 'orcado',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  spent_at date not null,
  paid_by_person text not null check (paid_by_person in ('pedro', 'camilly')),
  beneficiary_person text not null check (beneficiary_person in ('pedro', 'camilly', 'ambos')),
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  cost_type text not null default 'variavel',
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text,
  account_label text,
  is_installment boolean not null default false,
  installment_count integer not null default 1 check (installment_count > 0),
  current_installment integer not null default 1 check (current_installment > 0),
  installment_amount numeric(12,2) default 0 check (installment_amount >= 0),
  is_reimbursable boolean not null default true,
  should_split boolean not null default true,
  split_pedro_percent numeric(5,2) not null default 50 check (split_pedro_percent >= 0 and split_pedro_percent <= 100),
  split_camilly_percent numeric(5,2) not null default 50 check (split_camilly_percent >= 0 and split_camilly_percent <= 100),
  receipt_url text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_split_total check (should_split = false or round(split_pedro_percent + split_camilly_percent, 2) = 100)
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  payer_person text not null check (payer_person in ('pedro', 'camilly')),
  receiver_person text not null check (receiver_person in ('pedro', 'camilly')),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pendente',
  settled_at date,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  title text not null,
  category text not null default 'Geral',
  responsible_person text not null check (responsible_person in ('pedro', 'camilly', 'ambos')),
  due_date date,
  status text not null default 'pendente',
  priority text not null default 'media',
  is_done boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  date date not null,
  time text,
  activity text not null,
  location text,
  category text,
  estimated_cost numeric(12,2) not null default 0,
  actual_cost numeric(12,2) not null default 0,
  responsible_person text not null default 'ambos' check (responsible_person in ('pedro', 'camilly', 'ambos')),
  requires_booking boolean not null default false,
  booking_url text,
  status text not null default 'planejado',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  month date not null,
  person text not null check (person in ('pedro', 'camilly', 'ambos')),
  trip_id uuid references public.trips(id) on delete set null,
  target_amount numeric(12,2) not null check (target_amount >= 0),
  saved_amount numeric(12,2) not null default 0 check (saved_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  responsible_person text not null check (responsible_person in ('pedro', 'camilly')),
  description text not null,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  installment_count integer not null check (installment_count > 0),
  installment_amount numeric(12,2) not null default 0 check (installment_amount >= 0),
  current_installment integer not null default 1 check (current_installment > 0),
  due_date date not null,
  status text not null default 'pendente',
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, key)
);

create index on public.couple_members(user_id);
create index on public.trips(couple_id);
create index on public.expenses(couple_id, trip_id, spent_at);
create index on public.planned_expenses(couple_id, trip_id);
create index on public.checklist_items(couple_id, trip_id);
create index on public.installments(couple_id, due_date);

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'couples', 'trips', 'planned_expenses', 'expenses', 'settlements',
    'checklist_items', 'itinerary_items', 'savings_goals', 'installments', 'app_settings'
  ]
  loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.couple_members cm
    where cm.couple_id = target_couple_id
      and cm.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.trips enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.planned_expenses enable row level security;
alter table public.expenses enable row level security;
alter table public.settlements enable row level security;
alter table public.checklist_items enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.savings_goals enable row level security;
alter table public.installments enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles_select_workspace" on public.profiles for select using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.couple_members mine
    join public.couple_members other_member on other_member.couple_id = mine.couple_id
    where mine.user_id = auth.uid()
      and other_member.user_id = profiles.user_id
  )
);
create policy "profiles_insert_self" on public.profiles for insert with check (user_id = auth.uid());
create policy "profiles_update_self" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_delete_self" on public.profiles for delete using (user_id = auth.uid());

create policy "couples_select_members" on public.couples for select using (public.is_couple_member(id));
create policy "couples_insert_creator" on public.couples for insert with check (created_by = auth.uid());
create policy "couples_update_members" on public.couples for update using (public.is_couple_member(id)) with check (public.is_couple_member(id));
create policy "couples_delete_members" on public.couples for delete using (public.is_couple_member(id));

create policy "members_select_members" on public.couple_members for select using (public.is_couple_member(couple_id) or user_id = auth.uid());
create policy "members_insert_self_or_member" on public.couple_members for insert with check (user_id = auth.uid() or public.is_couple_member(couple_id));
create policy "members_update_members" on public.couple_members for update using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "members_delete_members" on public.couple_members for delete using (public.is_couple_member(couple_id));

create policy "categories_select" on public.categories for select using (couple_id is null or public.is_couple_member(couple_id));
create policy "categories_insert" on public.categories for insert with check (public.is_couple_member(couple_id));
create policy "categories_update" on public.categories for update using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "categories_delete" on public.categories for delete using (public.is_couple_member(couple_id) and is_default = false);

create policy "subcategories_select" on public.subcategories for select using (
  exists (select 1 from public.categories c where c.id = category_id and (c.couple_id is null or public.is_couple_member(c.couple_id)))
);
create policy "subcategories_insert" on public.subcategories for insert with check (
  exists (select 1 from public.categories c where c.id = category_id and public.is_couple_member(c.couple_id))
);
create policy "subcategories_update" on public.subcategories for update using (
  exists (select 1 from public.categories c where c.id = category_id and public.is_couple_member(c.couple_id))
) with check (
  exists (select 1 from public.categories c where c.id = category_id and public.is_couple_member(c.couple_id))
);
create policy "subcategories_delete" on public.subcategories for delete using (
  exists (select 1 from public.categories c where c.id = category_id and public.is_couple_member(c.couple_id))
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'trips', 'planned_expenses', 'expenses', 'settlements',
    'checklist_items', 'itinerary_items', 'savings_goals', 'installments', 'app_settings'
  ]
  loop
    execute format('create policy %I_select on public.%I for select using (public.is_couple_member(couple_id))', t, t);
    execute format('create policy %I_insert on public.%I for insert with check (public.is_couple_member(couple_id))', t, t);
    execute format('create policy %I_update on public.%I for update using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id))', t, t);
    execute format('create policy %I_delete on public.%I for delete using (public.is_couple_member(couple_id))', t, t);
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "receipts_select_members" on storage.objects for select using (
  bucket_id = 'receipts'
  and public.is_couple_member((storage.foldername(name))[1]::uuid)
);
create policy "receipts_insert_members" on storage.objects for insert with check (
  bucket_id = 'receipts'
  and public.is_couple_member((storage.foldername(name))[1]::uuid)
);
create policy "receipts_update_members" on storage.objects for update using (
  bucket_id = 'receipts'
  and public.is_couple_member((storage.foldername(name))[1]::uuid)
) with check (
  bucket_id = 'receipts'
  and public.is_couple_member((storage.foldername(name))[1]::uuid)
);
create policy "receipts_delete_members" on storage.objects for delete using (
  bucket_id = 'receipts'
  and public.is_couple_member((storage.foldername(name))[1]::uuid)
);

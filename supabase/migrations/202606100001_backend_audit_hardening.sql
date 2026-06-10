create or replace function public.is_couple_admin(target_couple_id uuid)
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
      and cm.role = 'admin'
  );
$$;

create unique index if not exists couple_members_one_workspace_per_user
  on public.couple_members(user_id);

drop policy if exists "couples_delete_members" on public.couples;
create policy "couples_delete_admins" on public.couples
  for delete using (public.is_couple_admin(id));

drop policy if exists "members_insert_self_or_member" on public.couple_members;
drop policy if exists "members_update_members" on public.couple_members;
drop policy if exists "members_delete_members" on public.couple_members;

create policy "members_insert_admins" on public.couple_members
  for insert with check (public.is_couple_admin(couple_id));

create policy "members_update_admins" on public.couple_members
  for update using (public.is_couple_admin(couple_id))
  with check (public.is_couple_admin(couple_id));

create policy "members_delete_admins" on public.couple_members
  for delete using (public.is_couple_admin(couple_id));

create or replace function public.prevent_invalid_member_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count integer;
begin
  if tg_op = 'UPDATE' and old.user_id = auth.uid() and old.role <> new.role then
    raise exception 'Nao e permitido alterar o proprio papel no casal.';
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.role = 'admin' then
    select count(*)
      into admin_count
      from public.couple_members
      where couple_id = old.couple_id
        and role = 'admin'
        and (tg_op <> 'DELETE' or id <> old.id)
        and (tg_op <> 'UPDATE' or id <> old.id or new.role = 'admin');

    if admin_count = 0 then
      raise exception 'O casal precisa manter ao menos um administrador.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists couple_members_prevent_invalid_role_change on public.couple_members;
create trigger couple_members_prevent_invalid_role_change
  before update or delete on public.couple_members
  for each row execute function public.prevent_invalid_member_role_change();

create or replace function public.validate_finance_row_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  trip_couple_id uuid;
  category_couple_id uuid;
  subcategory_category_id uuid;
  subcategory_couple_id uuid;
begin
  if new.trip_id is not null then
    select couple_id into trip_couple_id from public.trips where id = new.trip_id;
    if trip_couple_id is null or trip_couple_id <> new.couple_id then
      raise exception 'A viagem informada nao pertence ao casal do registro.';
    end if;
  end if;

  if new.category_id is not null then
    select couple_id into category_couple_id from public.categories where id = new.category_id;
    if category_couple_id is not null and category_couple_id <> new.couple_id then
      raise exception 'A categoria informada nao pertence ao casal do registro.';
    end if;
  end if;

  if new.subcategory_id is not null then
    select sc.category_id, c.couple_id
      into subcategory_category_id, subcategory_couple_id
      from public.subcategories sc
      join public.categories c on c.id = sc.category_id
      where sc.id = new.subcategory_id;

    if subcategory_category_id is null then
      raise exception 'A subcategoria informada nao existe.';
    end if;

    if new.category_id is not null and subcategory_category_id <> new.category_id then
      raise exception 'A subcategoria informada nao pertence a categoria selecionada.';
    end if;

    if subcategory_couple_id is not null and subcategory_couple_id <> new.couple_id then
      raise exception 'A subcategoria informada nao pertence ao casal do registro.';
    end if;
  end if;

  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['expenses', 'planned_expenses']
  loop
    execute format('drop trigger if exists %I_validate_integrity on public.%I', t, t);
    execute format('create trigger %I_validate_integrity before insert or update on public.%I for each row execute function public.validate_finance_row_integrity()', t, t);
  end loop;
end $$;

create or replace function public.validate_trip_scoped_row_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  trip_couple_id uuid;
begin
  if new.trip_id is not null then
    select couple_id into trip_couple_id from public.trips where id = new.trip_id;
    if trip_couple_id is null or trip_couple_id <> new.couple_id then
      raise exception 'A viagem informada nao pertence ao casal do registro.';
    end if;
  end if;

  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['settlements', 'checklist_items', 'itinerary_items', 'savings_goals', 'installments']
  loop
    execute format('drop trigger if exists %I_validate_trip_integrity on public.%I', t, t);
    execute format('create trigger %I_validate_trip_integrity before insert or update on public.%I for each row execute function public.validate_trip_scoped_row_integrity()', t, t);
  end loop;
end $$;

create or replace function public.create_workspace(
  p_full_name text,
  p_display_name text,
  p_person_key text,
  p_couple_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_couple_id uuid := gen_random_uuid();
  category_names text[] := array[
    'Transporte principal',
    'Transporte local',
    'Hospedagem',
    'Alimentação',
    'Lazer e encontros',
    'Casa e estadia',
    'Comunicação e internet',
    'Saúde e segurança',
    'Documentos e taxas',
    'Presentes e relacionamento',
    'Beleza e autocuidado',
    'Trabalho e estudo',
    'Pets, família e casa',
    'Imprevistos'
  ];
  category_name text;
  category_index integer := 0;
begin
  if current_user_id is null then
    raise exception 'Usuario autenticado e obrigatorio.';
  end if;

  if p_person_key not in ('pedro', 'camilly') then
    raise exception 'Pessoa invalida.';
  end if;

  if exists (select 1 from public.couple_members cm where cm.user_id = current_user_id) then
    raise exception 'Usuario ja possui um casal configurado.';
  end if;

  insert into public.profiles (user_id, full_name, display_name, person_key)
  values (current_user_id, p_full_name, p_display_name, p_person_key)
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    person_key = excluded.person_key;

  insert into public.couples (
    id,
    name,
    created_by,
    default_currency,
    default_split_pedro,
    default_split_camilly,
    monthly_budget_pedro,
    monthly_budget_camilly,
    monthly_budget_shared,
    emergency_reserve_percent
  ) values (
    new_couple_id,
    p_couple_name,
    current_user_id,
    'BRL',
    50,
    50,
    2200,
    1800,
    4000,
    12
  );

  insert into public.couple_members (couple_id, user_id, role, person_key)
  values (new_couple_id, current_user_id, 'admin', p_person_key);

  foreach category_name in array category_names
  loop
    insert into public.categories (couple_id, name, type, icon, color, is_default)
    values (
      new_couple_id,
      category_name,
      'expense',
      case
        when category_index = 0 then 'plane'
        when category_index = 3 then 'utensils'
        when category_index = 4 then 'heart'
        else 'tag'
      end,
      (array['#4779C4', '#7C8DD8', '#8A6FAE', '#2F9E65', '#C067A0', '#F59E0B'])[(category_index % 6) + 1],
      true
    );
    category_index := category_index + 1;
  end loop;

  return new_couple_id;
end;
$$;

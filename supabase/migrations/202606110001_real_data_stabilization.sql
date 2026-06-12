create or replace function public.generate_invite_code()
returns text
language sql
set search_path = public, extensions
as $$
  select upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 10));
$$;

alter table public.couples
  add column if not exists invite_code text;

update public.couples
set invite_code = public.generate_invite_code()
where invite_code is null;

alter table public.couples
  alter column invite_code set default public.generate_invite_code(),
  alter column invite_code set not null;

create unique index if not exists couples_invite_code_key
  on public.couples(invite_code);

create or replace function public.create_workspace(
  p_full_name text,
  p_display_name text,
  p_person_key text,
  p_couple_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := auth.uid();
  new_couple_id uuid := gen_random_uuid();
  clean_full_name text := nullif(trim(p_full_name), '');
  clean_display_name text := nullif(trim(p_display_name), '');
  clean_couple_name text := nullif(trim(p_couple_name), '');
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
    'Família e casa',
    'Imprevistos'
  ];
  category_name text;
  category_index integer := 0;
begin
  if current_user_id is null then
    raise exception 'Usuario autenticado e obrigatorio.';
  end if;

  if clean_full_name is null or clean_display_name is null or clean_couple_name is null then
    raise exception 'Nome, apelido e nome do espaco sao obrigatorios.';
  end if;

  if p_person_key not in ('pedro', 'camilly') then
    raise exception 'Pessoa invalida.';
  end if;

  if exists (select 1 from public.couple_members cm where cm.user_id = current_user_id) then
    raise exception 'Usuario ja possui um casal configurado.';
  end if;

  insert into public.profiles (user_id, full_name, display_name, person_key)
  values (current_user_id, clean_full_name, clean_display_name, p_person_key)
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    person_key = excluded.person_key,
    updated_at = now();

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
    clean_couple_name,
    current_user_id,
    'BRL',
    50,
    50,
    0,
    0,
    0,
    0
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
        when category_index = 1 then 'car'
        when category_index = 2 then 'home'
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

create or replace function public.join_workspace(
  p_full_name text,
  p_display_name text,
  p_person_key text,
  p_invite_code text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := auth.uid();
  target_couple_id uuid;
  clean_full_name text := nullif(trim(p_full_name), '');
  clean_display_name text := nullif(trim(p_display_name), '');
  clean_invite_code text := upper(regexp_replace(coalesce(trim(p_invite_code), ''), '\s+', '', 'g'));
begin
  if current_user_id is null then
    raise exception 'Usuario autenticado e obrigatorio.';
  end if;

  if clean_full_name is null or clean_display_name is null or clean_invite_code = '' then
    raise exception 'Nome, apelido e codigo de convite sao obrigatorios.';
  end if;

  if p_person_key not in ('pedro', 'camilly') then
    raise exception 'Pessoa invalida.';
  end if;

  if exists (select 1 from public.couple_members cm where cm.user_id = current_user_id) then
    raise exception 'Usuario ja possui um casal configurado.';
  end if;

  select c.id
    into target_couple_id
    from public.couples c
    where c.invite_code = clean_invite_code;

  if target_couple_id is null then
    raise exception 'Codigo de convite invalido.';
  end if;

  if exists (
    select 1
    from public.couple_members cm
    where cm.couple_id = target_couple_id
      and cm.person_key = p_person_key
  ) then
    raise exception 'Esta pessoa ja esta vinculada ao espaco.';
  end if;

  insert into public.profiles (user_id, full_name, display_name, person_key)
  values (current_user_id, clean_full_name, clean_display_name, p_person_key)
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    person_key = excluded.person_key,
    updated_at = now();

  insert into public.couple_members (couple_id, user_id, role, person_key)
  values (target_couple_id, current_user_id, 'membro', p_person_key);

  return target_couple_id;
end;
$$;

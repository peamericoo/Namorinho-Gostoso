-- Proposta de limpeza segura para Supabase.
-- NAO EXECUTAR sem revisar os e-mails reais que devem permanecer.
-- Impacto geral:
-- - Remove contas e workspaces de desenvolvimento conhecidos.
-- - Remove dados financeiros vinculados por cascade quando um casal e apagado.
-- - A etapa opcional de reset total remove dados da aplicacao e preserva somente os e-mails reais informados.

-- 1) Inventario antes de qualquer alteracao.
select 'auth.users' as tabela, count(*) as total from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'couples', count(*) from public.couples
union all select 'couple_members', count(*) from public.couple_members
union all select 'trips', count(*) from public.trips
union all select 'planned_expenses', count(*) from public.planned_expenses
union all select 'expenses', count(*) from public.expenses
union all select 'settlements', count(*) from public.settlements
union all select 'checklist_items', count(*) from public.checklist_items
union all select 'itinerary_items', count(*) from public.itinerary_items
union all select 'savings_goals', count(*) from public.savings_goals
union all select 'installments', count(*) from public.installments
union all select 'categories_custom', count(*) from public.categories where couple_id is not null
union all select 'storage.receipts', count(*) from storage.objects where bucket_id = 'receipts';

-- 2) Remocao direcionada dos registros de desenvolvimento conhecidos.
-- Impacto:
-- - Apaga os casais com UUIDs fixos usados pelos seeds/scripts antigos.
-- - Apaga contas auth com e-mails/UUIDs ficticios conhecidos.
-- - Apaga comprovantes associados a esses workspaces e uploads legados em /novo-gasto/.
begin;

delete from storage.objects
where bucket_id = 'receipts'
  and (
    name like '44444444-4444-4444-4444-444444444444/%'
    or name like '44444444-4444-4444-8444-444444444444/%'
    or name like '%/novo-gasto/%'
  );

delete from public.couples
where id in (
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-8444-444444444444'
);

delete from auth.identities
where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-4333-8333-333333333333'
)
or identity_data->>'email' in ('pedro@example.com', 'camilly@example.com');

delete from auth.users
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-4333-8333-333333333333'
)
or email in ('pedro@example.com', 'camilly@example.com');

-- Revise os totais antes de confirmar.
select 'auth.users' as tabela, count(*) as total from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'couples', count(*) from public.couples
union all select 'trips', count(*) from public.trips
union all select 'expenses', count(*) from public.expenses;

-- Troque ROLLBACK por COMMIT somente apos validar o resultado.
rollback;

-- 3) Opcional: reset estrutural completo mantendo apenas duas contas reais.
-- Substitua os placeholders antes de executar.
-- Impacto:
-- - Remove todos os dados da aplicacao: perfis, espacos, membros, viagens, gastos, metas,
--   parcelas, categorias personalizadas e comprovantes.
-- - Mantem somente as duas contas Supabase Auth informadas.
-- - Ao entrar novamente, as contas preservadas passarao pelo setup real do app.
/*
begin;

create temporary table keep_auth_emails(email text primary key) on commit drop;
insert into keep_auth_emails(email)
values
  ('SEU_EMAIL_REAL_AQUI'),
  ('EMAIL_REAL_DA_NAMORADA_AQUI');

delete from storage.objects
where bucket_id = 'receipts';

delete from public.profiles;
delete from public.couples;

delete from auth.identities
where user_id in (
  select u.id
  from auth.users u
  where not exists (
    select 1 from keep_auth_emails k where lower(k.email) = lower(u.email)
  )
);

delete from auth.users u
where not exists (
  select 1 from keep_auth_emails k where lower(k.email) = lower(u.email)
);

select email, id, created_at
from auth.users
order by created_at;

-- Troque ROLLBACK por COMMIT somente apos validar que sobraram exatamente as duas contas reais.
rollback;
*/

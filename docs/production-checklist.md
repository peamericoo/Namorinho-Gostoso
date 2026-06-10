# Checklist de producao backend

## Supabase Auth

- Configurar `site_url` para dominio real.
- Incluir redirects web e mobile reais, incluindo scheme do app.
- Manter `enable_anonymous_sign_ins=false`.
- Usar senha minima maior que 6 em producao se o publico for aberto.
- Avaliar `secure_password_change=true` em producao.

## Banco e RLS

- Aplicar todas as migrations.
- Confirmar que `is_couple_member` e `is_couple_admin` existem.
- Confirmar que policies de `couple_members` usam admin.
- Confirmar que `couples_delete_admins` substituiu delete por membro.
- Antes da unique `couple_members(user_id)`, auditar duplicados:

```sql
select user_id, count(*)
from public.couple_members
group by user_id
having count(*) > 1;
```

## Storage

- Bucket `receipts` deve ser privado.
- Paths devem seguir `couple_id/expense_id/file`.
- Procurar legados temporarios:

```sql
select name
from storage.objects
where bucket_id = 'receipts'
  and name like '%/novo-gasto/%';
```

## Backups e migrations

- Ativar backups do projeto Supabase.
- Testar restore em ambiente separado antes de producao critica.
- Rodar migrations em staging antes de producao.

## Logs e monitoramento

- Monitorar erros PostgREST/RLS no Supabase.
- Monitorar falhas de Storage upload.
- Acompanhar Auth failures e reset de senha.
- Registrar falhas de mutations no app com contexto de tabela e operacao.

## Testes minimos antes de deploy

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo export --platform web
```

## Testes manuais criticos

- Login, signup e recuperacao de senha.
- Setup de workspace por RPC.
- Criar gasto com comprovante.
- Marcar acerto e verificar saldo zerado.
- Tentar gerenciar membros como nao admin.
- Validar dois usuarios simultaneos recebendo atualizacoes.

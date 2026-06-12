# Relatorio de estabilizacao com dados reais

## Problemas encontrados

- O cliente Supabase possuia URL e anon key locais como fallback. Causa raiz: defaults hardcoded no codigo. Impacto: o app podia conectar em um banco local por engano quando variaveis reais faltassem.
- `supabase/seed.sql`, `supabase_setup.sql` e scripts em `scripts/` criavam usuarios, casal, viagens, gastos, metas e comprovantes de desenvolvimento. Causa raiz: massa inicial usada como produto. Impacto: fluxo real de cadastro/login ficava mascarado por dados preexistentes.
- A recuperacao de senha redirecionava para login, sem tela dedicada para efetivar a nova senha. Causa raiz: ausencia de rota de update de senha e captura de deep link/session. Impacto: usuario recebia link, mas nao conclui a troca no app.
- A criacao de espaco atendia apenas ao primeiro usuario. Causa raiz: havia RPC para criar workspace, mas nao havia mecanismo real para a segunda conta entrar no mesmo casal. Impacto: cada usuario tenderia a criar um espaco isolado.
- Configuracoes mantinham defaults com nome do casal e nao expunham gerenciamento basico de conta. Causa raiz: tela de conta incompleta. Impacto: troca de e-mail/senha e convite dependiam de operacao externa.

## Correcoes realizadas

- Removidos dados e caminhos demo:
  - `supabase/seed.sql` agora e intencionalmente vazio.
  - `supabase_setup.sql` removido.
  - `scripts/fix-cloud-auth-users.cjs` e `scripts/reset-cloud-first-access.cjs` removidos.
  - planilhas de exemplo em `outputs/` removidas.
  - gerador e previews antigos em `work/` removidos.
- Supabase:
  - `src/lib/supabase.ts` agora exige `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - `supabase/migrations/202606110001_real_data_stabilization.sql` adiciona `couples.invite_code`, recria `create_workspace` sem orcamentos ficticios e adiciona `join_workspace`.
  - `supabase/config.toml` inclui redirects para `profile-setup` e `reset-password`.
- Autenticacao:
  - `src/hooks/useAuth.tsx` captura links de auth, troca code/token por sessao, envia recovery para `/auth/reset-password`, adiciona troca de senha e troca de e-mail.
  - `app/auth/reset-password.tsx` criada para efetivar redefinicao de senha.
  - logout em telas principais redireciona para login.
- Criacao de espaco:
  - `app/auth/profile-setup.tsx` permite criar espaco real ou entrar por codigo de convite.
  - `src/services/finance.service.ts` adiciona `joinExistingWorkspace`.
  - `src/types/database.types.ts` e `src/types/models.ts` atualizados para contrato da nova RPC e `invite_code`.
- Conta:
  - `app/settings.tsx` exibe codigo de convite e adiciona troca de e-mail/senha.
- Documentacao:
  - `README.md`, `VALIDATION.md`, `agent.md`, `app/help.tsx` e `docs/backend-audit-report.md` atualizados para remover orientacao de usuario demo.

## SQL gerado para limpeza

- Arquivo: `docs/supabase-cleanup-proposal.sql`.
- Status: nao executado.
- Contem inventario previo, limpeza direcionada de UUIDs/e-mails conhecidos de desenvolvimento e uma rotina opcional de reset completo preservando duas contas reais informadas manualmente.

## Validacoes executadas

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run test`: passou, 4 suites e 23 testes.
- `npx expo export --platform web`: passou, incluindo a rota `/auth/reset-password`.

## Pendencias e riscos

- Aplicar a migration no Supabase real e validar via cadastro com dois e-mails reais.
- Conferir no painel Supabase Auth se os redirects de producao incluem a URL web final e o scheme mobile `planoadois://auth/reset-password`.
- Executar primeiro apenas o inventario do SQL de limpeza; so trocar `rollback` por `commit` apos revisar os totais.
- Exclusao de conta completa ainda nao foi implementada como botao no app. Hoje a remocao deve ser operacional via Supabase, porque envolve Auth, dados relacionais e storage.

# Plano a Dois

Aplicativo Expo + Supabase para organizar viagens, gastos, divisão de custos, metas e parcelamentos de um relacionamento à distância.

Interface e dados de exemplo em português do Brasil, com foco em Pedro Américo Paletot e Camilly Queiroz.

## Stack

- Expo, React Native, TypeScript e Expo Router
- Supabase Auth, PostgreSQL, Row Level Security e Storage
- TanStack Query para dados do servidor
- React Hook Form + Zod para formulários
- Zustand para estado local de UI
- date-fns, lucide-react-native e componentes próprios de gráfico compatíveis com mobile e web

## Como rodar localmente

Fluxo principal:

```bash
npm install
cp .env.example .env
npx supabase start
npx supabase db reset
npm run dev
```

Depois abra o app pelo Expo. Para web:

```bash
npm run web
```

Para mobile durante desenvolvimento:

```bash
npx expo start
```

Use o QR Code no Expo Go ou em um development build. O layout foi pensado para iPhone 13, POCO X6 Pro e web responsivo.

## Usuários demo locais

Depois de `npx supabase db reset`, estes usuários já existem:

- Pedro: `pedro@example.com`
- Camilly: `camilly@example.com`
- Senha: `relacionamento123`

Ao entrar com qualquer um deles, o app abre com viagens, gastos, custos planejados, checklist, roteiro, metas e parcelamentos reais no banco local.

## Variáveis de ambiente

`.env.example` já vem com URL local e anon key de desenvolvimento:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Em produção, substitua pelos valores do seu projeto Supabase.

Para recuperação de senha, configure no Supabase Auth os redirects web/mobile reais. Localmente o projeto aceita `http://localhost:19006`, `http://127.0.0.1:8081`, `planoadois://auth/login` e previews Vercel.

## Supabase

Arquivos principais:

- `supabase/config.toml`: configuração local do Supabase CLI.
- `supabase/migrations/202606080001_init.sql`: tabelas, índices, triggers, RLS e bucket privado `receipts`.
- `supabase/migrations/202606100001_backend_audit_hardening.sql`: hardening de RLS, RPC transacional de workspace, validações de integridade e proteção administrativa.
- `supabase/seed.sql`: usuários demo, casal, categorias, subcategorias e dados financeiros de exemplo.

Comandos úteis:

```bash
npx supabase start
npx supabase db reset
npx supabase status
```

O bucket `receipts` é privado. Os arquivos devem ficar no caminho `couple_id/expense_id/arquivo`, e as políticas permitem acesso apenas a membros do casal.

## Arquitetura backend

O app não possui servidor Node próprio. O backend efetivo é Supabase:

- Supabase Auth controla login, cadastro, sessão persistida e recuperação de senha.
- Postgres guarda perfis, casais, membros, viagens, gastos, acertos, metas, parcelas e configurações.
- Row Level Security isola dados por casal.
- Storage privado guarda comprovantes.
- Supabase Realtime invalida caches financeiros quando outro usuário altera dados do mesmo casal.

O modelo de autorização é:

- `membro`: pode operar dados financeiros do casal.
- `admin`: pode gerenciar membros e excluir o casal.

A criação de workspace usa a RPC transacional `create_workspace`, que cria perfil, casal, membership admin e categorias padrão em uma única operação de banco.

Mais detalhes:

- `docs/backend-architecture.md`
- `docs/backend-audit-report.md`
- `docs/backend-fixes-evidence.md`
- `docs/production-checklist.md`

## Funcionalidades implementadas

- Login, cadastro, recuperação de senha e setup de perfil/espaço
- Dashboard com KPIs, alertas, gráficos e próxima viagem
- Lista de viagens com busca e filtro
- Criar, editar, detalhar e excluir viagem
- Histórico de gastos com criação, edição, exclusão e comprovante
- Custos planejados com criação, edição e exclusão
- Divisão automática entre Pedro e Camilly
- Registro de acerto como concluído
- Simulador de viagem com salvamento como viagem
- Checklist com criação, edição, exclusão e marcar como concluído
- Roteiro e agenda com custos estimados e reais
- Metas de economia com progresso
- Parcelamentos com vencimento, progresso e marcar pago
- Categorias personalizadas
- Configurações de perfil, orçamentos e divisão padrão
- Ajuda rápida dentro do app

## Estrutura

```txt
app/                  rotas Expo Router
src/components/       componentes UI, financeiros, gráficos e formulários
src/hooks/            autenticação, workspace e queries/mutações
src/lib/              Supabase, cálculos, datas, validadores e formatadores
src/services/         serviços Supabase
src/store/            Zustand para filtros e preferências locais
src/tests/            testes unitários e integração leve
supabase/             config, migrations e seed
```

## Testes e validação

Comandos esperados:

```bash
npm run typecheck
npm run lint
npm run test
npm run web
npx expo export --platform web
```

Os testes cobrem:

- Totais de viagem
- Planejado vs realizado
- Responsabilidade por pessoa
- Resultado de compensação
- Simulador
- Progresso de economia
- Status de parcelas
- Validações de viagem, gasto e simulador
- Contrato básico dos serviços Supabase
- Regras corrigidas para gastos individuais, não reembolsáveis e acertos concluídos
- Validações de parcelas, faixas planejadas e status controlados
- Contrato da migration de hardening RLS/RPC/integridade

## Export web e Vercel

Gerar build web:

```bash
npx expo export --platform web
```

O build gera a pasta `dist`.

Configuração Vercel recomendada:

- Build command: `npx expo export --platform web`
- Output directory: `dist`
- Environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

O arquivo `vercel.json` já define o build command, output directory e rewrite para SPA.

## Android, iOS e EAS

```bash
npm run android
npm run ios
eas build --platform all
```

Para produção, crie um projeto Supabase, rode as migrations no ambiente de produção e configure as variáveis públicas no EAS/Vercel.

## Checklist de produção

- Criar projeto Supabase de produção
- Aplicar migrations
- Configurar URL e anon key de produção
- Revisar políticas RLS
- Configurar domínios permitidos no Supabase Auth
- Conferir redirects de recuperação de senha
- Auditar duplicidade em `couple_members(user_id)` antes de aplicar unique em bases existentes
- Validar upload de comprovantes
- Rodar `npm run typecheck`, `npm run lint`, `npm run test`
- Rodar `npx expo export --platform web`
- Configurar Vercel com output `dist`

Checklist detalhado: `docs/production-checklist.md`.

## Problemas comuns

- `npx supabase start` exige Docker Desktop rodando.
- Se o login demo falhar, rode `npx supabase db reset` novamente.
- Se o app web não conectar, confira `.env` e reinicie `npm run web`.
- Em dispositivo físico, se `127.0.0.1` não alcançar o Supabase local, use o IP da máquina na rede em `EXPO_PUBLIC_SUPABASE_URL`.

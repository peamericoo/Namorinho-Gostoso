# Relatorio de validacao

## Verificado nesta entrega

- `npm install` executado com Node/npm portatil local.
- `.env` criado a partir de `.env.example`.
- `npm run typecheck` passou.
- `npm run lint` passou.
- `npm run test` passou: 3 suites, 11 testes.
- `npx expo export --platform web` passou e gerou `dist`.
- `npx expo-doctor` passou: 18/18 checks.
- `npm run web -- --port 8081 --clear` esta servindo `http://localhost:8081`.
- Browser interno abriu `http://localhost:8081/auth/login` e confirmou os textos `Entrar` e `Criar conta`.

## Supabase local

- `npx supabase --version` respondeu `2.105.0`.
- `npx supabase start` foi tentado, mas este Windows nao tem Docker Desktop instalado/acessivel.
- Como consequencia, `npx supabase db reset` nao pode ser executado nesta maquina agora.

Erro retornado pelo Supabase CLI:

```txt
Docker Desktop is a prerequisite for local development.
```

Para validar login e persistencia local completa:

```bash
npm install
cp .env.example .env
npx supabase start
npx supabase db reset
npm run dev
```

Login demo apos reset:

- `pedro@example.com`
- `relacionamento123`

## Comandos finais executados com sucesso

```bash
npm install
npm run typecheck
npm run lint
npm run test
npx expo-doctor
npx expo export --platform web
npm run web -- --port 8081 --clear
```

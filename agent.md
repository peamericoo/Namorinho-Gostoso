# Projeto: Plano a Dois

Este documento foi criado para fornecer contexto à IA que vai continuar o desenvolvimento no ambiente Mac.

## Contexto e Estado Atual da Aplicação
A aplicação é focada em gerenciar viagens, gastos, divisão de custos e metas para um relacionamento à distância. O estado atual do projeto inclui funcionalidades de dashboard, cadastro de viagens e transações, integrados com Supabase.

**NOTA CRÍTICA**: O tutorial da aplicação atual "ficou uma merda literalmente e precisamos deletar ou resolver isso". (Isso é uma prioridade para o próximo agente).

## Stack Tecnológica
- **Front-end / Mobile**: Expo, React Native, TypeScript, Expo Router
- **Back-end / Banco de Dados**: Supabase (Auth, PostgreSQL, RLS, Storage)
- **Gerenciamento de Estado / Fetching**: TanStack Query, Zustand
- **Formulários / Validações**: React Hook Form + Zod
- **Pacotes extras**: date-fns, lucide-react-native

## Credenciais de Acesso
Não existem contas de teste ou credenciais demo no repositório. Use o cadastro real do Supabase Auth e o código de convite exibido em Configurações para vincular a segunda conta ao mesmo espaço.

## Como o Git e Setup foram feitos
O projeto está com Git inicializado. Ele foi criado em um ambiente Windows e movido de forma limpa.
Para rodar no Mac:
1. `npm install`
2. `npx supabase start` (necessita Docker)
3. `npx supabase db reset` (para aplicar as migrações sem popular dados fictícios)
4. `npm run dev` para rodar o app no Expo.

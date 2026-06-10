# Evidencias das correcoes backend

## Antes e depois

| Fluxo | Antes | Depois | Evidencia automatizada |
|---|---|---|---|
| Gasto individual Pedro -> Camilly | Pedro era responsabilizado quando pagava gasto individual para Camilly. | Camilly vira responsavel; Pedro fica credor. | `src/tests/unit/calculations.test.ts`: "responsabiliza o beneficiario..." |
| Gasto nao reembolsavel | Entrava no acerto mesmo marcado como nao reembolsavel. | Gera saldo zero entre pessoas. | `src/tests/unit/calculations.test.ts`: "nao gera acerto..." |
| Acerto concluido | Historico nao alterava saldo pendente. | `settlements.concluido`/`pago` abate o saldo. | `src/tests/unit/calculations.test.ts`: "abate acerto concluido..." |
| RLS membros | Qualquer membro podia gerenciar membros. | Apenas admin passa nas policies de insert/update/delete. | `src/tests/integration/rls-hardening.test.ts` verifica migration. |
| Criacao workspace | Cliente fazia upsert/insert em varias tabelas. | RPC `create_workspace` faz operacao transacional. | Teste de contrato da migration e chamada `supabase.rpc`. |
| FK cruzada | Despesa podia referenciar viagem/categoria de outro casal. | Triggers bloqueiam registros com `couple_id` divergente. | Teste de contrato da migration. |
| Comprovante novo | Upload usava `novo-gasto` antes do ID real. | Upload acontece apos criar o gasto e usa `expense.id`. | Fluxo em `ExpenseForm` e teste manual recomendado. |
| Parcelas | Parcela atual maior que total passava. | Zod bloqueia estado invalido. | `src/tests/unit/validators.test.ts`. |

## Comandos de verificacao

Resultados registrados nesta implementacao:

```bash
npm install
# Resultado: sucesso; 14 vulnerabilidades moderadas reportadas pela arvore npm.

npm run typecheck
# Resultado: sucesso.

npm run lint
# Resultado: sucesso.

npm test -- --runInBand
# Resultado: sucesso. 4 suites, 22 testes passados.

npx supabase db lint --local
# Resultado: bloqueado. Postgres local em 127.0.0.1:54322 recusou conexao.
```

Durante a auditoria inicial, antes da instalacao de dependencias, `jest`, `tsc` e `eslint` nao estavam disponiveis localmente. A instalacao de dependencias corrigiu isso; `jest-util@29.7.0` foi fixado como devDependency direta porque `ts-jest` exigia esse modulo em runtime.

## Evidencias manuais recomendadas

1. Criar usuario novo e concluir setup: confirmar que perfil, casal, membership e categorias aparecem juntos.
2. Criar gasto novo com comprovante: confirmar path no bucket como `couple_id/expense_id/arquivo`.
3. Criar gasto dividido de R$ 200 pago por Pedro e marcar acerto de R$ 100 pago por Camilly: confirmar que saldo pendente zera.
4. Entrar com dois usuarios do mesmo casal: alterar uma despesa em um cliente e confirmar atualizacao do outro via Realtime.
5. Tentar, como membro nao admin, alterar/remover `couple_members`: confirmar bloqueio por RLS.

## Limitacoes conhecidas

- O teste RLS atual e um teste de contrato da migration. Para prova end-to-end, rode Supabase local e execute cenarios autenticados com dois usuarios.
- A protecao contra sobrescrita simultanea ainda nao faz compare-and-swap por `updated_at`; o Realtime reduz defasagem, mas nao bloqueia uma edicao antiga enviada por ultimo.

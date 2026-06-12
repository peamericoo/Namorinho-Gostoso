# Relatorio tecnico backend

Data: 2026-06-10

## Resumo

A aplicacao usa Expo/React Native como cliente e Supabase como backend efetivo: Auth, Postgres, RLS e Storage. A auditoria encontrou riscos em autorizacao, integridade entre tabelas, criacao de workspace, calculo de acertos, comprovantes e validacoes de parcelas.

## Problemas encontrados e corrigidos

| Prioridade | Cenario | Por que falhava | Severidade | Impacto | Correcao aplicada | Risco da correcao |
|---|---|---|---|---|---|---|
| 1 | Qualquer membro podia atualizar/excluir membros e casal. Evidencia original: `couples_delete_members`, `members_*_members` na migration inicial. | RLS validava apenas participacao no casal, nao papel admin. | Alta | Remocao indevida de membros, alteracao de papeis e exclusao do casal. | Migration `202606100001_backend_audit_hardening.sql` cria `is_couple_admin`, troca policies de membros/exclusao de casal para admin e protege ultimo admin. | Medio: usuarios nao admin perdem poderes administrativos. |
| 2 | Marcar acerto como concluido nao reduzia o saldo pendente. | `calculateSettlement` considerava apenas despesas; `settlements` era historico passivo. | Alta | Usuario podia pagar duas vezes ou ver alerta falso de divida. | `calculateSettlement(expenses, settlements)` abate acertos `concluido`/`pago`; dashboard e tela de acertos passaram a enviar settlements. | Medio: historicos antigos agora afetam saldo. |
| 3 | Gasto individual pago por uma pessoa para beneficio da outra responsabilizava o pagador. | O calculo usava `beneficiary_person || paid_by_person` em vez de priorizar beneficiario. | Alta | Dividas individuais podiam ser zeradas ou invertidas. | `calculateExpenseResponsibility` usa `beneficiary_person`; `paid_by_person` fica apenas como credito de pagamento. | Baixo. |
| 4 | Campo `is_reimbursable` era salvo, mas ignorado. | O tipo/campo existia no formulario, mas nao entrava no calculo. | Media | Gastos marcados como nao reembolsaveis ainda geravam acerto. | Gastos `is_reimbursable=false` geram saldo zero entre pessoas. | Baixo. |
| 5 | Criacao de perfil/casal era uma sequencia de inserts no cliente. | Falha parcial podia deixar perfil sem casal, casal sem membro ou categorias incompletas. | Alta | Usuario preso em setup quebrado. | RPC transacional `create_workspace` cria perfil, casal, membro admin e categorias no banco. | Medio: precisa migration aplicada antes do app novo. |
| 6 | Usuario podia ter mais de um casal e o app pegava `.limit(1)`. | Nao havia constraint de um workspace por usuario nem ordenacao deterministica. | Media | App podia abrir workspace errado. | Unique index `couple_members_one_workspace_per_user`. | Medio: dados existentes duplicados precisam limpeza antes da migration. |
| 7 | Despesa podia apontar para viagem/categoria/subcategoria de outro casal. | FK simples garantia existencia, mas nao pertencia ao mesmo `couple_id`. | Alta | Dados cruzados entre casais, dashboards divergentes e vazamento logico. | Triggers `validate_finance_row_integrity` e `validate_trip_scoped_row_integrity`. | Medio: inserts invalidos antes aceitos passam a falhar. |
| 8 | Parcelas aceitavam `current_installment > installment_count` e valores incoerentes. | Validadores so exigiam numeros positivos. | Media | Progresso acima de 100% e impacto mensal incorreto. | Zod bloqueia parcela atual maior que total e valor de parcela incompatível. | Baixo. |
| 9 | Comprovante de gasto novo ia para `coupleId/novo-gasto/...`. | Upload acontecia antes de existir `expense.id`. | Media | Arquivos orfaos e vinculo fraco com gasto. | Formulario cria gasto primeiro, depois faz upload em `coupleId/expenseId/...` e atualiza `receipt_url`. | Medio: fluxo de submit mudou. |
| 10 | Sem sincronizacao multiusuario. | Mutations invalidavam cache local, mas outro usuario nao recebia atualizacao. | Media | Dados defasados em uso simultaneo. | Assinatura Supabase Realtime por `couple_id` invalida queries financeiras. | Medio: depende de Realtime habilitado. |
| 11 | Reset de senha dependia de redirect padrao local. | `resetPasswordForEmail` nao passava `redirectTo`. | Media | Link de recuperacao podia cair em URL errada. | Redirect explicito com `Linking.createURL("/auth/login")`; config local inclui `planoadois://auth/login`. | Baixo. |
| 12 | Status e faixas planejadas eram frouxos. | Campos livres aceitavam estado arbitrario e min/max inconsistentes. | Baixa | Estados invalidos em telas e relatorios. | Enums Zod e regras `min <= planned <= max`. | Baixo. |

## Debitos tecnicos remanescentes

- Testes RLS executando contra Supabase local ainda devem ser adicionados quando o CI tiver Docker/Supabase CLI disponivel.
- Conflito de edicao por `updated_at` foi mitigado por Realtime, mas controle otimista de lost update por registro ainda deve ser implementado em uma iteracao dedicada.
- Arquivos legados em `receipts/*/novo-gasto/*` devem ser removidos por rotina operacional, se existirem no bucket real.

## Plano de acao recomendado

1. Aplicar migrations em ambiente local e validar que o seed permanece vazio.
2. Rodar `npm run typecheck`, `npm run lint` e `npm test -- --runInBand`.
3. Validar manualmente signup/setup, gasto com comprovante, acerto e dois usuarios simultaneos.
4. Antes de producao, checar dados duplicados em `couple_members(user_id)`.
5. Configurar redirects finais do Supabase Auth para os dominios/app schemes reais.

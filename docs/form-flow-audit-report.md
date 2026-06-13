# Relatorio de auditoria de formularios e exclusoes

Data: 2026-06-13

## Escopo

- Fluxo de criacao/edicao/exclusao de gastos.
- Formularios em modais: categorias, checklist, custos planejados, metas, roteiro e parcelamentos.
- Mensagens de erro em PT-BR.
- Indicacao visual e programatica de campos obrigatorios.

## Problemas encontrados

1. Gasto com subcategoria vazia falhava no Supabase.
   - Causa raiz: `subcategory_id` era enviado como string vazia para uma coluna UUID.
   - Impacto: o insert/update podia falhar com erro tecnico e o usuario nao recebia explicacao clara.
   - Correcao: `expenseSchema` agora normaliza `subcategory_id` vazio para `null`, e o service tambem normaliza campos opcionais antes de escrever.

2. Exclusao de gastos dependia de `Alert.alert`.
   - Causa raiz: o dialog nativo do React Native e inconsistente no ambiente web.
   - Impacto: em producao web o usuario clicava em excluir e podia nao ver confirmacao nem acao.
   - Correcao: criado `DeleteButton`, com modal proprio da aplicacao, confirmacao explicita e erro visivel.

3. Deletes podiam parecer sucesso mesmo sem apagar nada.
   - Causa raiz: services executavam `delete().eq("id", id)` sem pedir retorno da linha apagada.
   - Impacto: RLS/permissao/id inexistente podiam resultar em UI confusa.
   - Correcao: deletes agora usam `select("id").maybeSingle()` e falham se nenhuma linha for removida.

4. Formularios em modais nao exibiam erro de API dentro do modal.
   - Causa raiz: varios formularios chamavam `form.handleSubmit(onSubmit)` sem `try/catch` local.
   - Impacto: falhas de Supabase ficavam silenciosas ou pouco claras.
   - Correcao: adicionados resumo de validacao e captura de erro em PT-BR nos forms de categoria, checklist, custo planejado, meta, roteiro, parcelamento e gasto.

5. Campos obrigatorios nao estavam consistentes.
   - Causa raiz: varios componentes obrigatorios nao recebiam a prop `required`.
   - Impacto: usuario nao sabia o que precisava preencher.
   - Correcao: campos obrigatorios receberam `*` visual e `accessibilityHint="Campo obrigatório"` em inputs, selects e datas.

## Arquivos alterados

- `src/components/ui/DeleteButton.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/DateInput.tsx`
- `src/lib/formFeedback.ts`
- `src/lib/validators.ts`
- `src/services/finance.service.ts`
- `src/components/forms/ExpenseForm.tsx`
- `src/components/forms/CategoryForm.tsx`
- `src/components/forms/ChecklistItemForm.tsx`
- `src/components/forms/PlannedExpenseForm.tsx`
- `src/components/forms/SavingsGoalForm.tsx`
- `src/components/forms/ItineraryItemForm.tsx`
- `src/components/forms/InstallmentForm.tsx`
- `app/expenses/[id].tsx`
- `app/categories.tsx`
- `app/checklist.tsx`
- `app/planned-expenses.tsx`
- `app/savings.tsx`
- `app/itinerary.tsx`
- `app/installments.tsx`
- `src/tests/unit/validators.test.ts`

## Validacoes executadas

- `npm run typecheck`
- `npm test -- --runInBand`

## Observacoes

- A criacao de gasto foi corrigida no nivel de schema e service, evitando UUID vazio.
- A exclusao agora tem confirmacao propria no app e retorna erro em PT-BR quando nao houver permissao ou registro.
- Viagem ja possuia modal proprio de confirmacao; o padrao foi estendido para os demais fluxos.

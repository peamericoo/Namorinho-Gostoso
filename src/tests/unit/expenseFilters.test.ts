import {
  defaultExpenseFilters,
  expenseFilterChips,
  filterExpenses,
  groupExpenses,
  normalizeSearchText,
  summarizeExpenses
} from "../../lib/expenseFilters";
import type { Category, Expense, PlannedExpense, Trip } from "../../types/models";

const foodCategory: Category = {
  id: "cat-food",
  couple_id: "couple-1",
  name: "Alimentação",
  type: "expense",
  icon: "utensils",
  color: "#C067A0",
  is_default: true
};

const transportCategory: Category = {
  id: "cat-transport",
  couple_id: "couple-1",
  name: "Transporte local",
  type: "expense",
  icon: "car",
  color: "#4779C4",
  is_default: true
};

const trip: Trip = {
  id: "trip-1",
  couple_id: "couple-1",
  title: "Primeiro Encontro",
  traveler_person: "pedro",
  host_person: "camilly",
  trip_kind: "visit",
  direction: "Pedro visita Camilly",
  origin_city: "João Pessoa",
  destination_city: "Cuiabá",
  start_date: "2026-07-01",
  end_date: "2026-07-05",
  status: "planejada",
  planned_budget: 300,
  priority: "media"
};

const secondTrip: Trip = {
  ...trip,
  id: "trip-2",
  title: "Aniversário",
  origin_city: "Cuiabá",
  destination_city: "João Pessoa",
  planned_budget: 1000
};

const expenses: Expense[] = [
  {
    id: "expense-food",
    couple_id: "couple-1",
    trip_id: "trip-1",
    spent_at: "2026-07-01",
    paid_by_person: "pedro",
    beneficiary_person: "ambos",
    category_id: "cat-food",
    cost_type: "variavel",
    description: "Jantar especial",
    amount: 200,
    payment_method: "Pix",
    account_label: "Conta Pedro",
    is_installment: false,
    installment_count: 1,
    current_installment: 1,
    installment_amount: 200,
    is_reimbursable: true,
    should_split: true,
    split_pedro_percent: 50,
    split_camilly_percent: 50,
    notes: "Mesa reservada",
    category: foodCategory,
    trip
  },
  {
    id: "expense-transport",
    couple_id: "couple-1",
    trip_id: "trip-1",
    spent_at: "2026-07-02",
    paid_by_person: "camilly",
    beneficiary_person: "pedro",
    category_id: "cat-transport",
    cost_type: "fixo",
    description: "Uber aeroporto",
    amount: 180,
    payment_method: "Cartão de crédito",
    account_label: "Cartão Camilly",
    is_installment: false,
    installment_count: 1,
    current_installment: 1,
    installment_amount: 180,
    is_reimbursable: true,
    should_split: false,
    split_pedro_percent: 100,
    split_camilly_percent: 0,
    category: transportCategory,
    trip
  },
  {
    id: "expense-gift",
    couple_id: "couple-1",
    trip_id: "trip-2",
    spent_at: "2026-08-10",
    paid_by_person: "pedro",
    beneficiary_person: "camilly",
    category_id: "cat-food",
    cost_type: "opcional",
    description: "Café da manhã",
    amount: 90,
    payment_method: "Dinheiro",
    is_installment: false,
    installment_count: 1,
    current_installment: 1,
    installment_amount: 90,
    is_reimbursable: false,
    should_split: false,
    split_pedro_percent: 0,
    split_camilly_percent: 100,
    category: foodCategory,
    trip: secondTrip
  }
];

const plannedExpenses: PlannedExpense[] = [
  {
    id: "planned-1",
    couple_id: "couple-1",
    trip_id: "trip-1",
    owner_person: "pedro",
    category_id: "cat-food",
    cost_type: "variavel",
    description: "Comidas",
    planned_amount: 250,
    probability: 100,
    is_required: true,
    paid_by_person: "ambos",
    beneficiary_person: "ambos",
    is_installment: false,
    installment_count: 1,
    status: "orcado"
  }
];

describe("expenseFilters", () => {
  it("normaliza busca sem acentos", () => {
    expect(normalizeSearchText("Alimentação em Cuiabá")).toBe("alimentacao em cuiaba");
  });

  it("busca por pessoa em pagador e beneficiário", () => {
    const result = filterExpenses(expenses, { ...defaultExpenseFilters, search: "Pedro" });
    expect(result.map((expense) => expense.id)).toEqual(["expense-food", "expense-transport", "expense-gift"]);
  });

  it("busca categoria sem depender de acento", () => {
    const result = filterExpenses(expenses, { ...defaultExpenseFilters, search: "alimentacao" });
    expect(result.map((expense) => expense.id)).toEqual(["expense-food", "expense-gift"]);
  });

  it("aplica filtros combinados e atualiza escopo", () => {
    const result = filterExpenses(expenses, {
      ...defaultExpenseFilters,
      tripId: "trip-1",
      paidBy: "camilly",
      minAmount: "100",
      maxAmount: "200",
      splitMode: "individual"
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("expense-transport");
  });

  it("filtra somente viagens acima do orçamento", () => {
    const result = filterExpenses(expenses, { ...defaultExpenseFilters, overBudgetOnly: true }, { trips: [trip, secondTrip], plannedExpenses, allExpenses: expenses });
    expect(result.map((expense) => expense.id)).toEqual(["expense-food", "expense-transport"]);
  });

  it("resume totais e acerto estimado", () => {
    const summary = summarizeExpenses(expenses.slice(0, 2));
    expect(summary.total).toBe(380);
    expect(summary.count).toBe(2);
    expect(summary.topCategory?.label).toBe("Alimentação");
    expect(summary.sharedTotal).toBe(200);
    expect(summary.settlement.amount).toBeGreaterThan(0);
  });

  it("agrupa por categoria com subtotal", () => {
    const groups = groupExpenses(expenses, "categoria");
    expect(groups[0].label).toBe("Alimentação");
    expect(groups[0].total).toBe(290);
    expect(groups[1].label).toBe("Transporte local");
  });

  it("gera chips dos filtros ativos", () => {
    const chips = expenseFilterChips(
      { ...defaultExpenseFilters, tripId: "trip-1", search: "pix", splitMode: "shared" },
      { tripLabel: (id) => (id === "trip-1" ? "Primeiro Encontro" : id) }
    );
    expect(chips.map((chip) => chip.label)).toEqual(["Busca: pix", "Viagem: Primeiro Encontro", "Compartilhados"]);
  });
});

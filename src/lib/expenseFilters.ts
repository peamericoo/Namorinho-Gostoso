import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { costTypes, labelPerson, labelStatus } from "../constants/categories";
import type { Expense, PersonKey, PlannedExpense, SettlementSummary, Trip } from "../types/models";
import { actualByTrip, calculateSettlement, plannedByTrip, sum } from "./calculations";
import { dateBR, money, monthBR } from "./formatters";

export type ExpenseViewMode = "todos" | "categoria" | "pessoa" | "viagem" | "data" | "tipo";
export type ExpensePersonGrouping = "paid_by" | "beneficiary";
export type ExpenseSplitMode = "todos" | "shared" | "individual";
export type ExpenseReimbursableMode = "todos" | "reimbursable" | "not_reimbursable";

export type ExpenseFilters = {
  search: string;
  tripId: string;
  dateFrom: string;
  dateTo: string;
  paidBy: string;
  beneficiary: string;
  categoryId: string;
  costType: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  splitMode: ExpenseSplitMode;
  reimbursableMode: ExpenseReimbursableMode;
  overBudgetOnly: boolean;
};

export type ExpenseFilterContext = {
  trips?: Trip[];
  plannedExpenses?: PlannedExpense[];
  allExpenses?: Expense[];
};

export type ExpenseSummary = {
  total: number;
  count: number;
  largestExpense: Expense | null;
  topCategory: { label: string; amount: number } | null;
  paidByPedro: number;
  paidByCamilly: number;
  sharedTotal: number;
  individualTotal: number;
  settlement: SettlementSummary;
};

export type ExpenseGroup = {
  key: string;
  label: string;
  subtitle?: string;
  total: number;
  count: number;
  expenses: Expense[];
  color?: string;
};

export const defaultExpenseFilters: ExpenseFilters = {
  search: "",
  tripId: "todos",
  dateFrom: "",
  dateTo: "",
  paidBy: "todos",
  beneficiary: "todos",
  categoryId: "todos",
  costType: "todos",
  paymentMethod: "todos",
  minAmount: "",
  maxAmount: "",
  splitMode: "todos",
  reimbursableMode: "todos",
  overBudgetOnly: false
};

export function normalizeSearchText(value?: string | number | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buildExpenseSearchText(expense: Expense) {
  const labels = [
    expense.description,
    expense.category?.name,
    expense.trip?.title,
    expense.trip?.direction,
    expense.trip?.origin_city,
    expense.trip?.destination_city,
    expense.trip?.purpose,
    labelPerson(expense.paid_by_person),
    labelPerson(expense.beneficiary_person),
    labelStatus(expense.cost_type),
    expense.cost_type,
    expense.payment_method,
    expense.account_label,
    expense.notes,
    expense.spent_at,
    dateBR(expense.spent_at),
    expense.amount,
    money(expense.amount),
    expense.should_split ? "dividido compartilhado ambos" : "individual",
    expense.is_reimbursable ? "reembolsavel reembolsável" : "nao reembolsavel nao reembolsável",
    expense.receipt_url ? "comprovante recibo" : "",
    expense.is_installment ? "parcelado parcelas" : "a vista avista"
  ];

  return normalizeSearchText(labels.filter(Boolean).join(" "));
}

export function parseOptionalAmount(value: string) {
  const clean = value.trim();
  if (!clean) return null;
  const normalized = clean.replace(/\s/g, "").replace(/[R$]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters, context: ExpenseFilterContext = {}) {
  const search = normalizeSearchText(filters.search);
  const minAmount = parseOptionalAmount(filters.minAmount);
  const maxAmount = parseOptionalAmount(filters.maxAmount);
  const overBudgetTripIds = filters.overBudgetOnly ? getOverBudgetTripIds(context.trips ?? [], context.allExpenses ?? expenses, context.plannedExpenses ?? []) : new Set<string>();

  return expenses.filter((expense) => {
    if (search && !buildExpenseSearchText(expense).includes(search)) return false;
    if (filters.tripId !== "todos" && expense.trip_id !== filters.tripId) return false;
    if (filters.dateFrom && expense.spent_at.slice(0, 10) < filters.dateFrom) return false;
    if (filters.dateTo && expense.spent_at.slice(0, 10) > filters.dateTo) return false;
    if (filters.paidBy !== "todos" && expense.paid_by_person !== filters.paidBy) return false;
    if (filters.beneficiary !== "todos" && expense.beneficiary_person !== filters.beneficiary) return false;
    if (filters.categoryId !== "todos" && expense.category_id !== filters.categoryId) return false;
    if (filters.costType !== "todos" && expense.cost_type !== filters.costType) return false;
    if (filters.paymentMethod !== "todos" && (expense.payment_method ?? "") !== filters.paymentMethod) return false;
    if (minAmount !== null && expense.amount < minAmount) return false;
    if (maxAmount !== null && expense.amount > maxAmount) return false;
    if (filters.splitMode === "shared" && !expense.should_split) return false;
    if (filters.splitMode === "individual" && expense.should_split) return false;
    if (filters.reimbursableMode === "reimbursable" && !expense.is_reimbursable) return false;
    if (filters.reimbursableMode === "not_reimbursable" && expense.is_reimbursable) return false;
    if (filters.overBudgetOnly && (!expense.trip_id || !overBudgetTripIds.has(expense.trip_id))) return false;
    return true;
  });
}

export function summarizeExpenses(expenses: Expense[]): ExpenseSummary {
  const totals = expenses.reduce(
    (acc, expense) => {
      acc.total += expense.amount;
      if (expense.paid_by_person === "pedro") acc.paidByPedro += expense.amount;
      if (expense.paid_by_person === "camilly") acc.paidByCamilly += expense.amount;
      if (expense.should_split) acc.sharedTotal += expense.amount;
      else acc.individualTotal += expense.amount;
      return acc;
    },
    { total: 0, paidByPedro: 0, paidByCamilly: 0, sharedTotal: 0, individualTotal: 0 }
  );

  const largestExpense = expenses.reduce<Expense | null>((largest, expense) => (!largest || expense.amount > largest.amount ? expense : largest), null);
  const topCategory = topCategoryFor(expenses);

  return {
    total: totals.total,
    count: expenses.length,
    largestExpense,
    topCategory,
    paidByPedro: totals.paidByPedro,
    paidByCamilly: totals.paidByCamilly,
    sharedTotal: totals.sharedTotal,
    individualTotal: totals.individualTotal,
    settlement: calculateSettlement(expenses)
  };
}

export function groupExpenses(expenses: Expense[], mode: ExpenseViewMode, personGrouping: ExpensePersonGrouping = "paid_by") {
  if (mode === "todos") {
    return makeGroups(expenses, (_expense) => ({
      key: "todos",
      label: "Todos os gastos",
      subtitle: "Lista completa com busca e filtros ativos"
    }));
  }

  if (mode === "categoria") {
    return makeGroups(expenses, (expense) => ({
      key: expense.category_id ?? "sem-categoria",
      label: expense.category?.name ?? "Sem categoria",
      color: expense.category?.color
    }));
  }

  if (mode === "pessoa") {
    return makeGroups(expenses, (expense) => {
      const person = personGrouping === "paid_by" ? expense.paid_by_person : expense.beneficiary_person;
      return {
        key: String(person),
        label: personGrouping === "paid_by" ? `Pago por ${labelPerson(person)}` : `Beneficiário ${labelPerson(person)}`,
        subtitle: personGrouping === "paid_by" ? "Agrupado por quem pagou" : "Agrupado por quem usou/recebeu"
      };
    });
  }

  if (mode === "viagem") {
    return makeGroups(expenses, (expense) => ({
      key: expense.trip_id ?? "sem-viagem",
      label: expense.trip?.title ?? "Sem viagem",
      subtitle: expense.trip ? `${expense.trip.origin_city} -> ${expense.trip.destination_city}` : "Gastos sem viagem vinculada"
    }));
  }

  if (mode === "data") {
    const granularity = dateGranularity(expenses);
    return makeGroups(expenses, (expense) => {
      const date = parseISO(expense.spent_at);
      const key = granularity === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");
      return {
        key,
        label: granularity === "day" ? dateBR(expense.spent_at) : monthBR(expense.spent_at),
        subtitle: granularity === "day" ? "Gastos do dia" : "Gastos do mês"
      };
    }).sort((a, b) => b.key.localeCompare(a.key));
  }

  return makeGroups(expenses, (expense) => ({
    key: expense.cost_type,
    label: labelStatus(expense.cost_type),
    subtitle: costTypes.includes(expense.cost_type) ? "Tipo de custo" : undefined
  }));
}

export function activeExpenseFilterCount(filters: ExpenseFilters) {
  const defaults = defaultExpenseFilters;
  return (Object.keys(defaults) as (keyof ExpenseFilters)[]).filter((key) => filters[key] !== defaults[key]).length;
}

export function expenseFilterChips(filters: ExpenseFilters, lookups: { tripLabel?: (id: string) => string; categoryLabel?: (id: string) => string } = {}) {
  const chips: { key: keyof ExpenseFilters; label: string }[] = [];
  if (filters.search) chips.push({ key: "search", label: `Busca: ${filters.search}` });
  if (filters.tripId !== "todos") chips.push({ key: "tripId", label: `Viagem: ${lookups.tripLabel?.(filters.tripId) ?? filters.tripId}` });
  if (filters.dateFrom) chips.push({ key: "dateFrom", label: `De: ${dateBR(filters.dateFrom)}` });
  if (filters.dateTo) chips.push({ key: "dateTo", label: `Até: ${dateBR(filters.dateTo)}` });
  if (filters.paidBy !== "todos") chips.push({ key: "paidBy", label: `Pago por ${labelPerson(filters.paidBy)}` });
  if (filters.beneficiary !== "todos") chips.push({ key: "beneficiary", label: `Beneficiário ${labelPerson(filters.beneficiary)}` });
  if (filters.categoryId !== "todos") chips.push({ key: "categoryId", label: `Categoria: ${lookups.categoryLabel?.(filters.categoryId) ?? filters.categoryId}` });
  if (filters.costType !== "todos") chips.push({ key: "costType", label: `Tipo: ${labelStatus(filters.costType)}` });
  if (filters.paymentMethod !== "todos") chips.push({ key: "paymentMethod", label: `Pagamento: ${filters.paymentMethod}` });
  if (filters.minAmount) chips.push({ key: "minAmount", label: `Min: ${filters.minAmount}` });
  if (filters.maxAmount) chips.push({ key: "maxAmount", label: `Max: ${filters.maxAmount}` });
  if (filters.splitMode !== "todos") chips.push({ key: "splitMode", label: filters.splitMode === "shared" ? "Compartilhados" : "Individuais" });
  if (filters.reimbursableMode !== "todos") chips.push({ key: "reimbursableMode", label: filters.reimbursableMode === "reimbursable" ? "Reembolsáveis" : "Não reembolsáveis" });
  if (filters.overBudgetOnly) chips.push({ key: "overBudgetOnly", label: "Viagens acima do orçamento" });
  return chips;
}

function getOverBudgetTripIds(trips: Trip[], expenses: Expense[], plannedExpenses: PlannedExpense[]) {
  const ids = new Set<string>();
  trips.forEach((trip) => {
    const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
    const actual = actualByTrip(trip.id, expenses);
    if (planned > 0 && actual > planned) ids.add(trip.id);
  });
  return ids;
}

function topCategoryFor(expenses: Expense[]) {
  const groups = new Map<string, { label: string; amount: number }>();
  expenses.forEach((expense) => {
    const key = expense.category_id ?? "sem-categoria";
    const current = groups.get(key) ?? { label: expense.category?.name ?? "Sem categoria", amount: 0 };
    current.amount += expense.amount;
    groups.set(key, current);
  });
  return Array.from(groups.values()).sort((a, b) => b.amount - a.amount)[0] ?? null;
}

function makeGroups(expenses: Expense[], getMeta: (expense: Expense) => Pick<ExpenseGroup, "key" | "label" | "subtitle" | "color">) {
  const groups = new Map<string, ExpenseGroup>();
  expenses.forEach((expense) => {
    const meta = getMeta(expense);
    const group = groups.get(meta.key) ?? {
      key: meta.key,
      label: meta.label,
      subtitle: meta.subtitle,
      color: meta.color,
      total: 0,
      count: 0,
      expenses: []
    };
    group.total += expense.amount;
    group.count += 1;
    group.expenses.push(expense);
    groups.set(meta.key, group);
  });
  return Array.from(groups.values()).sort((a, b) => b.total - a.total);
}

function dateGranularity(expenses: Expense[]) {
  if (expenses.length <= 1) return "day";
  const timestamps = expenses.map((expense) => parseISO(expense.spent_at).getTime()).sort((a, b) => a - b);
  const first = new Date(timestamps[0]);
  const last = new Date(timestamps[timestamps.length - 1]);
  return differenceInCalendarDays(last, first) <= 45 ? "day" : "month";
}

export function personKeysForFilters(): PersonKey[] {
  return ["pedro", "camilly", "ambos"];
}

export function paymentMethodsFromExpenses(expenses: Expense[]) {
  return Array.from(new Set(expenses.map((expense) => expense.payment_method).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function totalForExpenses(expenses: Expense[]) {
  return sum(expenses.map((expense) => expense.amount));
}

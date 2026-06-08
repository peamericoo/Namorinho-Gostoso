import { addDays, differenceInCalendarDays, isBefore, parseISO } from "date-fns";
import type { ChecklistItem, Expense, Installment, PlannedExpense, SavingsGoal, Trip } from "../types/models";
import { daysTogether } from "./dates";

export type ExpenseResponsibility = {
  pedroResponsibility: number;
  camillyResponsibility: number;
  paidByPedro: number;
  paidByCamilly: number;
  pedroBalance: number;
  camillyBalance: number;
};

export function sum(values: (number | null | undefined)[]): number {
  return values.reduce<number>((acc, value) => acc + Number(value ?? 0), 0);
}

export function plannedByTrip(tripId: string, plannedExpenses: PlannedExpense[]) {
  return sum(plannedExpenses.filter((item) => item.trip_id === tripId).map((item) => item.planned_amount));
}

export function actualByTrip(tripId: string, expenses: Expense[]) {
  return sum(expenses.filter((item) => item.trip_id === tripId).map((item) => item.amount));
}

export function calculateExpenseResponsibility(expense: Pick<Expense, "amount" | "paid_by_person" | "beneficiary_person" | "should_split" | "split_pedro_percent" | "split_camilly_percent">): ExpenseResponsibility {
  const amount = Number(expense.amount ?? 0);
  let pedroResponsibility = 0;
  let camillyResponsibility = 0;

  if (expense.should_split) {
    pedroResponsibility = amount * (Number(expense.split_pedro_percent ?? 0) / 100);
    camillyResponsibility = amount * (Number(expense.split_camilly_percent ?? 0) / 100);
  } else if (expense.beneficiary_person === "pedro" || expense.paid_by_person === "pedro") {
    pedroResponsibility = amount;
  } else if (expense.beneficiary_person === "camilly" || expense.paid_by_person === "camilly") {
    camillyResponsibility = amount;
  } else {
    pedroResponsibility = amount / 2;
    camillyResponsibility = amount / 2;
  }

  const paidByPedro = expense.paid_by_person === "pedro" ? amount : 0;
  const paidByCamilly = expense.paid_by_person === "camilly" ? amount : 0;
  const pedroBalance = paidByPedro - pedroResponsibility;
  const camillyBalance = paidByCamilly - camillyResponsibility;

  return { pedroResponsibility, camillyResponsibility, paidByPedro, paidByCamilly, pedroBalance, camillyBalance };
}

export function calculateSettlement(expenses: Expense[]) {
  const totals = expenses.map(calculateExpenseResponsibility);
  const totalPaidByPedro = sum(totals.map((item) => item.paidByPedro));
  const totalPaidByCamilly = sum(totals.map((item) => item.paidByCamilly));
  const pedroResponsibility = sum(totals.map((item) => item.pedroResponsibility));
  const camillyResponsibility = sum(totals.map((item) => item.camillyResponsibility));
  const pedroBalance = totalPaidByPedro - pedroResponsibility;
  const camillyBalance = totalPaidByCamilly - camillyResponsibility;
  const amount = Math.abs(pedroBalance);

  if (Math.abs(pedroBalance) < 0.01 && Math.abs(camillyBalance) < 0.01) {
    return {
      totalPaidByPedro,
      totalPaidByCamilly,
      pedroResponsibility,
      camillyResponsibility,
      pedroBalance,
      camillyBalance,
      payer: null,
      receiver: null,
      amount: 0,
      message: "Tudo certo, ninguém deve nada"
    };
  }

  if (pedroBalance > 0) {
    return {
      totalPaidByPedro,
      totalPaidByCamilly,
      pedroResponsibility,
      camillyResponsibility,
      pedroBalance,
      camillyBalance,
      payer: "camilly" as const,
      receiver: "pedro" as const,
      amount,
      message: `Camilly deve pagar ${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para Pedro`
    };
  }

  return {
    totalPaidByPedro,
    totalPaidByCamilly,
    pedroResponsibility,
    camillyResponsibility,
    pedroBalance,
    camillyBalance,
    payer: "pedro" as const,
    receiver: "camilly" as const,
    amount,
    message: `Pedro deve pagar ${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para Camilly`
  };
}

export function tripSummary(trip: Trip, expenses: Expense[], plannedExpenses: PlannedExpense[]) {
  const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
  const actual = actualByTrip(trip.id, expenses);
  const days = daysTogether(trip.start_date, trip.end_date);
  return {
    planned,
    actual,
    difference: planned - actual,
    usage: planned > 0 ? actual / planned : 0,
    days,
    costPerDay: days > 0 ? actual / days : 0
  };
}

export type SimulatorInput = {
  startDate: string;
  endDate: string;
  ticketAmount: number;
  lodgingPerNight: number;
  foodPerDay: number;
  localTransportPerDay: number;
  leisurePerDay: number;
  giftsAmount: number;
  beautyAmount: number;
  groceriesAmount: number;
  emergencyAmount: number;
  safetyMarginPercent: number;
  pedroPercent: number;
  camillyPercent: number;
  monthsUntilTrip: number;
  currentSavings: number;
};

export function calculateSimulation(input: SimulatorInput) {
  const days = daysTogether(input.startDate, input.endDate);
  const nights = Math.max(days - 1, 0);
  const lodgingTotal = input.lodgingPerNight * nights;
  const foodTotal = input.foodPerDay * days;
  const localTransportTotal = input.localTransportPerDay * days;
  const leisureTotal = input.leisurePerDay * days;
  const subtotal = input.ticketAmount + lodgingTotal + foodTotal + localTransportTotal + leisureTotal + input.giftsAmount + input.beautyAmount + input.groceriesAmount + input.emergencyAmount;
  const safetyMargin = subtotal * (input.safetyMarginPercent / 100);
  const grandTotal = subtotal + safetyMargin;
  const monthlyRequired = Math.max(grandTotal - input.currentSavings, 0) / Math.max(input.monthsUntilTrip, 1);
  const riskRatio = monthlyRequired / Math.max(grandTotal, 1);
  const viability = riskRatio > 0.35 ? "Risco alto" : riskRatio > 0.2 ? "Atenção" : "Viável";

  return {
    days,
    nights,
    lodgingTotal,
    foodTotal,
    localTransportTotal,
    leisureTotal,
    safetyMargin,
    grandTotal,
    costPerDay: grandTotal / Math.max(days, 1),
    pedroTotal: grandTotal * (input.pedroPercent / 100),
    camillyTotal: grandTotal * (input.camillyPercent / 100),
    monthlyRequired,
    viability,
    riskAlert: viability === "Risco alto" ? "Reduza passagem, hospedagem ou lazer antes de confirmar." : viability === "Atenção" ? "Cabe no orçamento, mas precisa de disciplina." : "Plano confortável para a meta atual.",
    suggestion: viability === "Risco alto" ? "Busque passagem com antecedência e uma hospedagem mais simples." : "Mantenha a margem de segurança e revise os preços semanalmente."
  };
}

export function savingsProgress(goal: SavingsGoal) {
  const progress = goal.target_amount > 0 ? goal.saved_amount / goal.target_amount : 0;
  return {
    progress,
    remaining: Math.max(goal.target_amount - goal.saved_amount, 0)
  };
}

export function savingsOverview(goals: SavingsGoal[]) {
  const target = sum(goals.map((goal) => goal.target_amount));
  const saved = sum(goals.map((goal) => goal.saved_amount));
  const averageMonthly = goals.length ? saved / goals.length : 0;
  return {
    target,
    saved,
    progress: target > 0 ? saved / target : 0,
    remaining: Math.max(target - saved, 0),
    averageMonthly,
    estimatedMonths: averageMonthly > 0 ? Math.ceil(Math.max(target - saved, 0) / averageMonthly) : null
  };
}

export function installmentStatus(installment: Installment, reference = new Date()) {
  const due = parseISO(installment.due_date);
  const paid = installment.status === "pago" || installment.status === "concluido";
  const overdue = !paid && isBefore(due, reference);
  const dueSoon = !paid && !overdue && isBefore(due, addDays(reference, 7));
  const remainingInstallments = Math.max(installment.installment_count - installment.current_installment, 0);
  return {
    paid,
    overdue,
    dueSoon,
    remainingInstallments,
    progress: installment.installment_count > 0 ? installment.current_installment / installment.installment_count : 0,
    monthlyImpact: installment.installment_amount || installment.total_amount / Math.max(installment.installment_count, 1)
  };
}

export function smartAlerts(params: {
  trips: Trip[];
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  checklistItems: ChecklistItem[];
  installments: Installment[];
  savingsGoals: SavingsGoal[];
}) {
  const alerts: { tone: "warning" | "danger" | "success"; message: string }[] = [];
  const now = new Date();
  const settlement = calculateSettlement(params.expenses);

  params.trips.forEach((trip) => {
    const summary = tripSummary(trip, params.expenses, params.plannedExpenses);
    const startsIn = differenceInCalendarDays(parseISO(trip.start_date), now);
    if (summary.usage > 1) alerts.push({ tone: "danger", message: `${trip.title} está acima do orçamento.` });
    if (startsIn <= 20 && startsIn >= 0 && !trip.tickets_url) alerts.push({ tone: "warning", message: `${trip.title} está próxima e ainda não tem link de passagem.` });
    if (startsIn <= 20 && startsIn >= 0 && !trip.accommodation_url) alerts.push({ tone: "warning", message: `${trip.title} está próxima e ainda não tem hospedagem.` });
    const tripChecklist = params.checklistItems.filter((item) => item.trip_id === trip.id);
    if (tripChecklist.some((item) => !item.is_done) && startsIn <= 15 && startsIn >= 0) alerts.push({ tone: "warning", message: `${trip.title} tem checklist pendente.` });
  });

  params.installments.forEach((installment) => {
    const status = installmentStatus(installment, now);
    if (status.overdue) alerts.push({ tone: "danger", message: `${installment.description} está com parcela vencida.` });
    else if (status.dueSoon) alerts.push({ tone: "warning", message: `${installment.description} vence nos próximos 7 dias.` });
  });

  if (settlement.amount > 0) alerts.push({ tone: "warning", message: "Existe valor pendente de acerto entre Pedro e Camilly." });
  if (savingsOverview(params.savingsGoals).progress < 0.8 && params.savingsGoals.length > 0) alerts.push({ tone: "warning", message: "A meta de economia está abaixo do esperado." });
  if (alerts.length === 0) alerts.push({ tone: "success", message: "Tudo organizado para as próximas visitas." });

  return alerts.slice(0, 6);
}

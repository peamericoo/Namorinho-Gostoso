import {
  calculateExpenseResponsibility,
  calculateSettlement,
  calculateSimulation,
  installmentStatus,
  savingsOverview,
  tripSummary
} from "../../lib/calculations";
import type { Expense, Installment, PlannedExpense, SavingsGoal, Trip } from "../../types/models";

const trip: Trip = {
  id: "trip-1",
  couple_id: "couple-1",
  title: "Teste",
  traveler_person: "pedro",
  host_person: "camilly",
  direction: "Pedro visita Camilly",
  origin_city: "João Pessoa",
  destination_city: "Cuiabá",
  start_date: "2026-07-01",
  end_date: "2026-07-05",
  status: "planejada",
  planned_budget: 1000,
  priority: "media"
};

const baseExpense: Expense = {
  id: "expense-1",
  couple_id: "couple-1",
  trip_id: "trip-1",
  spent_at: "2026-07-01",
  paid_by_person: "pedro",
  beneficiary_person: "ambos",
  cost_type: "variavel",
  description: "Jantar",
  amount: 200,
  is_installment: false,
  installment_count: 1,
  current_installment: 1,
  installment_amount: 200,
  is_reimbursable: true,
  should_split: true,
  split_pedro_percent: 50,
  split_camilly_percent: 50
};

describe("cálculos financeiros", () => {
  it("calcula responsabilidade por gasto dividido", () => {
    const result = calculateExpenseResponsibility(baseExpense);
    expect(result.pedroResponsibility).toBe(100);
    expect(result.camillyResponsibility).toBe(100);
    expect(result.pedroBalance).toBe(100);
  });

  it("calcula acerto sugerido", () => {
    const result = calculateSettlement([baseExpense]);
    expect(result.payer).toBe("camilly");
    expect(result.receiver).toBe("pedro");
    expect(result.amount).toBe(100);
    expect(result.message).toContain("Camilly deve pagar");
  });

  it("calcula totais de viagem", () => {
    const planned: PlannedExpense[] = [{ ...baseExpense, id: "planned-1", owner_person: "pedro", planned_amount: 900, min_amount: 800, max_amount: 1100, probability: 100, is_required: true, paid_by_person: "pedro", beneficiary_person: "ambos", status: "orcado" }];
    const result = tripSummary(trip, [baseExpense], planned);
    expect(result.actual).toBe(200);
    expect(result.planned).toBe(1000);
    expect(result.days).toBe(5);
    expect(result.costPerDay).toBe(40);
  });

  it("calcula simulador de viagem", () => {
    const result = calculateSimulation({
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      ticketAmount: 1000,
      lodgingPerNight: 200,
      foodPerDay: 80,
      localTransportPerDay: 40,
      leisurePerDay: 60,
      giftsAmount: 100,
      beautyAmount: 0,
      groceriesAmount: 150,
      emergencyAmount: 200,
      safetyMarginPercent: 10,
      pedroPercent: 50,
      camillyPercent: 50,
      monthsUntilTrip: 4,
      currentSavings: 500
    });
    expect(result.days).toBe(5);
    expect(result.grandTotal).toBeGreaterThan(0);
    expect(result.pedroTotal).toBeCloseTo(result.camillyTotal);
  });

  it("calcula progresso de economia", () => {
    const goals: SavingsGoal[] = [
      { id: "s1", couple_id: "c1", month: "2026-06-01", person: "pedro", target_amount: 500, saved_amount: 300 },
      { id: "s2", couple_id: "c1", month: "2026-06-01", person: "camilly", target_amount: 500, saved_amount: 200 }
    ];
    const result = savingsOverview(goals);
    expect(result.progress).toBe(0.5);
    expect(result.remaining).toBe(500);
  });

  it("identifica parcela vencida", () => {
    const installment: Installment = {
      id: "i1",
      couple_id: "c1",
      responsible_person: "pedro",
      description: "Passagem",
      total_amount: 900,
      installment_count: 3,
      installment_amount: 300,
      current_installment: 1,
      due_date: "2026-01-01",
      status: "pendente"
    };
    expect(installmentStatus(installment, new Date("2026-01-10")).overdue).toBe(true);
  });
});

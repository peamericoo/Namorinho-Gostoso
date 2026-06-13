import { expenseSchema, installmentSchema, plannedExpenseSchema, simulatorSchema, tripSchema } from "../../lib/validators";

const validExpense = {
  trip_id: "trip-1",
  spent_at: "2026-07-01",
  paid_by_person: "pedro",
  beneficiary_person: "ambos",
  category_id: "cat-1",
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

describe("validadores", () => {
  it("aceita viagem válida", () => {
    const result = tripSchema.safeParse({
      title: "Pedro visitando Camilly",
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
    });
    expect(result.success).toBe(true);
  });

  it("aceita viagem passada concluída", () => {
    const result = tripSchema.safeParse({
      title: "Primeira visita antiga",
      traveler_person: "pedro",
      host_person: "camilly",
      direction: "Pedro visita Camilly",
      origin_city: "João Pessoa",
      destination_city: "Cuiabá",
      start_date: "2025-02-10",
      end_date: "2025-02-15",
      status: "concluida",
      planned_budget: 0,
      priority: "media"
    });
    expect(result.success).toBe(true);
  });

  it("aceita viagem dos dois para outro destino", () => {
    const result = tripSchema.safeParse({
      title: "Rio juntos",
      trip_kind: "shared_destination",
      traveler_person: "pedro",
      host_person: "camilly",
      direction: "Pedro e Camilly viajam para Rio de Janeiro",
      origin_city: "Casa",
      destination_city: "Rio de Janeiro",
      start_date: "2026-09-10",
      end_date: "2026-09-16",
      status: "planejada",
      planned_budget: 2500,
      priority: "alta"
    });
    expect(result.success).toBe(true);
  });

  it("bloqueia data de volta antes da ida", () => {
    const result = tripSchema.safeParse({
      title: "Viagem",
      traveler_person: "pedro",
      host_person: "camilly",
      direction: "Pedro visita Camilly",
      origin_city: "A",
      destination_city: "B",
      start_date: "2026-07-05",
      end_date: "2026-07-01",
      status: "planejada",
      planned_budget: 100,
      priority: "media"
    });
    expect(result.success).toBe(false);
  });

  it("bloqueia divisão que não soma 100", () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      split_pedro_percent: 70,
      split_camilly_percent: 20
    });
    expect(result.success).toBe(false);
  });

  it("bloqueia parcela atual maior que total de parcelas no gasto", () => {
    const result = expenseSchema.safeParse({
      ...validExpense,
      is_installment: true,
      installment_count: 3,
      current_installment: 4,
      installment_amount: 66.67
    });
    expect(result.success).toBe(false);
  });

  it("bloqueia custo planejado fora da faixa min/max", () => {
    const result = plannedExpenseSchema.safeParse({
      trip_id: "trip-1",
      owner_person: "pedro",
      expected_date: "2026-07-01",
      category_id: "cat-1",
      cost_type: "variavel",
      description: "Hospedagem",
      planned_amount: 900,
      min_amount: 1000,
      max_amount: 1200,
      probability: 100,
      is_required: true,
      paid_by_person: "pedro",
      beneficiary_person: "ambos",
      is_installment: false,
      installment_count: 1,
      status: "orcado"
    });
    expect(result.success).toBe(false);
  });

  it("bloqueia parcelamento com valor de parcela incompatível", () => {
    const result = installmentSchema.safeParse({
      trip_id: "trip-1",
      responsible_person: "pedro",
      description: "Passagem",
      total_amount: 1000,
      installment_count: 3,
      installment_amount: 300,
      current_installment: 1,
      due_date: "2026-07-01",
      status: "pendente"
    });
    expect(result.success).toBe(false);
  });

  it("aceita simulador válido", () => {
    const result = simulatorSchema.safeParse({
      trip_kind: "shared_destination",
      traveler_person: "pedro",
      origin_city: "João Pessoa",
      destination_city: "Cuiabá",
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      lodgingType: "Airbnb",
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
    expect(result.success).toBe(true);
  });

  it("bloqueia simulador sem tipo de viagem", () => {
    const result = simulatorSchema.safeParse({
      trip_kind: "",
      traveler_person: "pedro",
      origin_city: "João Pessoa",
      destination_city: "Rio de Janeiro",
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      lodgingType: "Hotel",
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
    expect(result.success).toBe(false);
  });
});

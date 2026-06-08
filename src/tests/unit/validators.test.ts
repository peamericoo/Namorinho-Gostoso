import { expenseSchema, simulatorSchema, tripSchema } from "../../lib/validators";

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
      split_pedro_percent: 70,
      split_camilly_percent: 20
    });
    expect(result.success).toBe(false);
  });

  it("aceita simulador válido", () => {
    const result = simulatorSchema.safeParse({
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
});

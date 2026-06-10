import { z } from "zod";

const required = "Preencha este campo.";
const nonNegative = "O valor não pode ser negativo.";

export const personSchema = z.enum(["pedro", "camilly"], { error: required });
export const personOrBothSchema = z.enum(["pedro", "camilly", "ambos"], { error: required });
export const tripStatusSchema = z.enum(["planejada", "em_andamento", "concluida", "cancelada", "adiada"], { error: required });
export const prioritySchema = z.enum(["alta", "media", "baixa"], { error: required });
export const costTypeSchema = z.enum(["fixo", "variavel", "emergencial", "opcional"], { error: required });
export const plannedExpenseStatusSchema = z.enum(["orcado", "reservado", "ideia", "comprado", "cancelado"], { error: required });
export const operationalStatusSchema = z.enum(["pendente", "em_andamento", "concluido", "cancelado", "planejado", "ideia"], { error: required });
export const installmentStatusSchema = z.enum(["pendente", "pago", "concluido", "atrasado", "cancelado"], { error: required });

export const tripSchema = z
  .object({
    title: z.string().min(2, "Informe o nome da viagem."),
    traveler_person: personSchema,
    host_person: personSchema,
    direction: z.string().min(2, required),
    origin_city: z.string().min(2, required),
    destination_city: z.string().min(2, required),
    start_date: z.string().min(10, "Informe a data de ida."),
    end_date: z.string().min(10, "Informe a data de volta."),
    status: tripStatusSchema,
    purpose: z.string().optional().nullable(),
    planned_budget: z.coerce.number().min(0, nonNegative),
    priority: prioritySchema,
    tickets_url: z.string().optional().nullable(),
    accommodation_url: z.string().optional().nullable(),
    itinerary_url: z.string().optional().nullable(),
    ticket_deadline: z.string().optional().nullable(),
    accommodation_deadline: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
  .refine((data) => !data.start_date || !data.end_date || data.end_date >= data.start_date, {
    path: ["end_date"],
    message: "A volta não pode ser antes da ida."
  });

export const expenseSchema = z
  .object({
    trip_id: z.string().min(1, "Escolha a viagem."),
    spent_at: z.string().min(10, "Informe a data."),
    paid_by_person: personSchema,
    beneficiary_person: personOrBothSchema,
    category_id: z.string().min(1, "Escolha a categoria."),
    subcategory_id: z.string().optional().nullable(),
    cost_type: costTypeSchema,
    description: z.string().min(2, "Descreva o gasto."),
    amount: z.coerce.number().positive("O valor deve ser maior que zero."),
    payment_method: z.string().optional().nullable(),
    account_label: z.string().optional().nullable(),
    is_installment: z.coerce.boolean(),
    installment_count: z.coerce.number().int().min(1, "Informe ao menos 1 parcela."),
    current_installment: z.coerce.number().int().min(1, "Informe a parcela atual."),
    installment_amount: z.coerce.number().min(0, nonNegative),
    is_reimbursable: z.coerce.boolean(),
    should_split: z.coerce.boolean(),
    split_pedro_percent: z.coerce.number().min(0).max(100),
    split_camilly_percent: z.coerce.number().min(0).max(100),
    receipt_url: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
  .refine((data) => !data.should_split || Math.round((data.split_pedro_percent + data.split_camilly_percent) * 100) / 100 === 100, {
    path: ["split_pedro_percent"],
    message: "A divisão precisa somar 100%."
  })
  .refine((data) => !data.is_installment || data.installment_count > 1, {
    path: ["installment_count"],
    message: "Informe o número de parcelas."
  })
  .refine((data) => data.current_installment <= data.installment_count, {
    path: ["current_installment"],
    message: "A parcela atual não pode ser maior que o total de parcelas."
  })
  .refine((data) => !data.is_installment || data.installment_amount === 0 || Math.abs(data.installment_amount * data.installment_count - data.amount) <= data.installment_count * 0.01, {
    path: ["installment_amount"],
    message: "Valor da parcela incompatível com o total."
  });

export const plannedExpenseSchema = z
  .object({
    trip_id: z.string().min(1, "Escolha a viagem."),
    owner_person: personSchema,
    expected_date: z.string().optional().nullable(),
    category_id: z.string().min(1, "Escolha a categoria."),
    subcategory_id: z.string().optional().nullable(),
    cost_type: costTypeSchema,
    description: z.string().min(2, "Descreva o custo."),
    planned_amount: z.coerce.number().min(0, nonNegative),
    min_amount: z.coerce.number().min(0, nonNegative),
    max_amount: z.coerce.number().min(0, nonNegative),
    probability: z.coerce.number().min(0).max(100),
    is_required: z.coerce.boolean(),
    paid_by_person: personOrBothSchema,
    beneficiary_person: personOrBothSchema,
    payment_method: z.string().optional().nullable(),
    is_installment: z.coerce.boolean(),
    installment_count: z.coerce.number().int().min(1),
    status: plannedExpenseStatusSchema,
    notes: z.string().optional().nullable()
  })
  .refine((data) => data.max_amount === 0 || data.min_amount <= data.max_amount, {
    path: ["max_amount"],
    message: "O valor máximo não pode ser menor que o mínimo."
  })
  .refine((data) => data.min_amount === 0 || data.planned_amount >= data.min_amount, {
    path: ["planned_amount"],
    message: "O planejado não pode ser menor que o mínimo."
  })
  .refine((data) => data.max_amount === 0 || data.planned_amount <= data.max_amount, {
    path: ["planned_amount"],
    message: "O planejado não pode ser maior que o máximo."
  })
  .refine((data) => !data.is_installment || data.installment_count > 1, {
    path: ["installment_count"],
    message: "Informe o número de parcelas."
  });

export const simulatorSchema = z
  .object({
    traveler_person: personSchema,
    origin_city: z.string().min(2, required),
    destination_city: z.string().min(2, required),
    startDate: z.string().min(10, required),
    endDate: z.string().min(10, required),
    lodgingType: z.string().min(2, required),
    ticketAmount: z.coerce.number().min(0, nonNegative),
    lodgingPerNight: z.coerce.number().min(0, nonNegative),
    foodPerDay: z.coerce.number().min(0, nonNegative),
    localTransportPerDay: z.coerce.number().min(0, nonNegative),
    leisurePerDay: z.coerce.number().min(0, nonNegative),
    giftsAmount: z.coerce.number().min(0, nonNegative),
    beautyAmount: z.coerce.number().min(0, nonNegative),
    groceriesAmount: z.coerce.number().min(0, nonNegative),
    emergencyAmount: z.coerce.number().min(0, nonNegative),
    safetyMarginPercent: z.coerce.number().min(0).max(100),
    pedroPercent: z.coerce.number().min(0).max(100),
    camillyPercent: z.coerce.number().min(0).max(100),
    monthsUntilTrip: z.coerce.number().int().min(1, "Informe pelo menos 1 mês."),
    currentSavings: z.coerce.number().min(0, nonNegative)
  })
  .refine((data) => data.endDate >= data.startDate, { path: ["endDate"], message: "A volta não pode ser antes da ida." })
  .refine((data) => Math.round((data.pedroPercent + data.camillyPercent) * 100) / 100 === 100, {
    path: ["pedroPercent"],
    message: "A divisão precisa somar 100%."
  });

export const checklistSchema = z.object({
  trip_id: z.string().min(1, "Escolha a viagem."),
  title: z.string().min(2, "Informe o item."),
  category: z.string().min(2, required),
  responsible_person: personOrBothSchema,
  due_date: z.string().optional().nullable(),
  status: operationalStatusSchema,
  priority: prioritySchema,
  is_done: z.coerce.boolean(),
  notes: z.string().optional().nullable()
});

export const itinerarySchema = z.object({
  trip_id: z.string().min(1, "Escolha a viagem."),
  date: z.string().min(10, required),
  time: z.string().optional().nullable(),
  activity: z.string().min(2, "Informe a atividade."),
  location: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  estimated_cost: z.coerce.number().min(0, nonNegative),
  actual_cost: z.coerce.number().min(0, nonNegative),
  responsible_person: personOrBothSchema,
  requires_booking: z.coerce.boolean(),
  booking_url: z.string().optional().nullable(),
  status: operationalStatusSchema,
  notes: z.string().optional().nullable()
});

export const savingsGoalSchema = z.object({
  month: z.string().min(10, "Informe o mês."),
  person: personOrBothSchema,
  trip_id: z.string().optional().nullable(),
  target_amount: z.coerce.number().min(0, nonNegative),
  saved_amount: z.coerce.number().min(0, nonNegative),
  notes: z.string().optional().nullable()
});

export const installmentSchema = z
  .object({
    trip_id: z.string().optional().nullable(),
    responsible_person: personSchema,
    description: z.string().min(2, "Descreva o parcelamento."),
    total_amount: z.coerce.number().min(0, nonNegative),
    installment_count: z.coerce.number().int().min(1),
    installment_amount: z.coerce.number().min(0, nonNegative),
    current_installment: z.coerce.number().int().min(1),
    due_date: z.string().min(10, "Informe o vencimento."),
    status: installmentStatusSchema,
    payment_method: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
  .refine((data) => data.current_installment <= data.installment_count, {
    path: ["current_installment"],
    message: "A parcela atual não pode ser maior que o total de parcelas."
  })
  .refine((data) => data.installment_amount === 0 || Math.abs(data.installment_amount * data.installment_count - data.total_amount) <= data.installment_count * 0.01, {
    path: ["installment_amount"],
    message: "Valor da parcela incompatível com o total."
  });

export const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  icon: z.string().min(1, required),
  color: z.string().min(4, required),
  subcategory: z.string().optional().nullable()
});

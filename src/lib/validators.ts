import { z } from "zod";

const required = "Preencha este campo.";
const nonNegative = "O valor não pode ser negativo.";
const invalidNumber = "Informe um valor numérico válido.";

function parseLocalizedNumber(value: string | number) {
  if (typeof value === "number") return value;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  let normalized = trimmed.replace(/\s/g, "").replace(/[R$]/g, "").replace(/[^\d,.-]/g, "");
  if (!normalized || normalized === "-" || normalized === "," || normalized === ".") return Number.NaN;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.split(thousandSeparator).join("").replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (lastDot >= 0) {
    const parts = normalized.split(".");
    if (parts.length > 2) {
      normalized = parts.join("");
    } else if (parts[1]?.length === 3 && parts[0].length <= 3) {
      normalized = parts.join("");
    }
  }

  return Number(normalized);
}

function emptyToNull(value: string | null | undefined) {
  return typeof value === "string" && value.trim() === "" ? null : value ?? null;
}

const optionalStringInput = z.union([z.string(), z.null()]);
const localizedNumber = z.union([z.string(), z.number()]).transform(parseLocalizedNumber).pipe(z.number({ error: invalidNumber }));
const nonNegativeNumber = localizedNumber.pipe(z.number().min(0, nonNegative));
const positiveNumber = localizedNumber.pipe(z.number().positive("O valor deve ser maior que zero."));
const percentNumber = localizedNumber.pipe(z.number().min(0).max(100));
const positiveInteger = localizedNumber.pipe(z.number().int().min(1));
const optionalDate = optionalStringInput.transform(emptyToNull).optional();
const optionalText = optionalStringInput.transform(emptyToNull).optional();

export const personSchema = z.enum(["pedro", "camilly"], { error: required });
export const personOrBothSchema = z.enum(["pedro", "camilly", "ambos"], { error: required });
export const tripKindSchema = z.enum(["visit", "shared_destination"], { error: required });
export const tripStatusSchema = z.enum(["planejada", "em_andamento", "concluida", "cancelada", "adiada"], { error: required });
export const prioritySchema = z.enum(["alta", "media", "baixa"], { error: required });
export const costTypeSchema = z.enum(["fixo", "variavel", "emergencial", "opcional"], { error: required });
export const plannedExpenseStatusSchema = z.enum(["orcado", "reservado", "ideia", "comprado", "cancelado"], { error: required });
export const operationalStatusSchema = z.enum(["pendente", "em_andamento", "concluido", "cancelado", "planejado", "ideia"], { error: required });
export const installmentStatusSchema = z.enum(["pendente", "pago", "concluido", "atrasado", "cancelado"], { error: required });

export const tripSchema = z
  .object({
    title: z.string().min(2, "Informe o nome da viagem."),
    trip_kind: tripKindSchema.default("visit"),
    traveler_person: personSchema,
    host_person: personSchema,
    direction: z.string().min(2, required),
    origin_city: z.string().min(2, required),
    destination_city: z.string().min(2, required),
    start_date: z.string().min(10, "Informe a data de ida."),
    end_date: z.string().min(10, "Informe a data de volta."),
    status: tripStatusSchema,
    purpose: optionalText,
    planned_budget: nonNegativeNumber,
    priority: prioritySchema,
    tickets_url: optionalText,
    accommodation_url: optionalText,
    itinerary_url: optionalText,
    ticket_deadline: optionalDate,
    accommodation_deadline: optionalDate,
    notes: optionalText
  })
  .refine((data) => data.traveler_person !== data.host_person, {
    path: ["host_person"],
    message: "Escolha a outra pessoa."
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
    subcategory_id: optionalText,
    cost_type: costTypeSchema,
    description: z.string().min(2, "Descreva o gasto."),
    amount: positiveNumber,
    payment_method: optionalText,
    account_label: optionalText,
    is_installment: z.coerce.boolean(),
    installment_count: positiveInteger,
    current_installment: positiveInteger,
    installment_amount: nonNegativeNumber,
    is_reimbursable: z.coerce.boolean(),
    should_split: z.coerce.boolean(),
    split_pedro_percent: percentNumber,
    split_camilly_percent: percentNumber,
    receipt_url: optionalText,
    notes: optionalText
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
    expected_date: optionalDate,
    category_id: z.string().min(1, "Escolha a categoria."),
    subcategory_id: optionalText,
    cost_type: costTypeSchema,
    description: z.string().min(2, "Descreva o custo."),
    planned_amount: nonNegativeNumber,
    min_amount: nonNegativeNumber,
    max_amount: nonNegativeNumber,
    probability: percentNumber,
    is_required: z.coerce.boolean(),
    paid_by_person: personOrBothSchema,
    beneficiary_person: personOrBothSchema,
    payment_method: optionalText,
    is_installment: z.coerce.boolean(),
    installment_count: positiveInteger,
    status: plannedExpenseStatusSchema,
    notes: optionalText
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
    trip_kind: tripKindSchema,
    traveler_person: personSchema,
    origin_city: z.string().min(2, required),
    destination_city: z.string().min(2, required),
    startDate: z.string().min(10, required),
    endDate: z.string().min(10, required),
    lodgingType: z.string().min(2, required),
    ticketAmount: nonNegativeNumber,
    lodgingPerNight: nonNegativeNumber,
    foodPerDay: nonNegativeNumber,
    localTransportPerDay: nonNegativeNumber,
    leisurePerDay: nonNegativeNumber,
    giftsAmount: nonNegativeNumber,
    beautyAmount: nonNegativeNumber,
    groceriesAmount: nonNegativeNumber,
    emergencyAmount: nonNegativeNumber,
    safetyMarginPercent: percentNumber,
    pedroPercent: percentNumber,
    camillyPercent: percentNumber,
    monthsUntilTrip: positiveInteger,
    currentSavings: nonNegativeNumber
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
  due_date: optionalDate,
  status: operationalStatusSchema,
  priority: prioritySchema,
  is_done: z.coerce.boolean(),
  notes: optionalText
});

export const itinerarySchema = z.object({
  trip_id: z.string().min(1, "Escolha a viagem."),
  date: z.string().min(10, required),
  time: optionalText,
  activity: z.string().min(2, "Informe a atividade."),
  location: optionalText,
  category: optionalText,
  estimated_cost: nonNegativeNumber,
  actual_cost: nonNegativeNumber,
  responsible_person: personOrBothSchema,
  requires_booking: z.coerce.boolean(),
  booking_url: optionalText,
  status: operationalStatusSchema,
  notes: optionalText
});

export const savingsGoalSchema = z.object({
  month: z.string().min(10, "Informe o mês."),
  person: personOrBothSchema,
  trip_id: optionalText,
  target_amount: nonNegativeNumber,
  saved_amount: nonNegativeNumber,
  notes: optionalText
});

export const installmentSchema = z
  .object({
    trip_id: optionalText,
    responsible_person: personSchema,
    description: z.string().min(2, "Descreva o parcelamento."),
    total_amount: nonNegativeNumber,
    installment_count: positiveInteger,
    installment_amount: nonNegativeNumber,
    current_installment: positiveInteger,
    due_date: z.string().min(10, "Informe o vencimento."),
    status: installmentStatusSchema,
    payment_method: optionalText,
    notes: optionalText
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
  subcategory: optionalText
});

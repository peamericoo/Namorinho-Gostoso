export type PersonKey = "pedro" | "camilly" | "ambos";
export type TripStatus = "planejada" | "em_andamento" | "concluida" | "cancelada" | "adiada";
export type Priority = "alta" | "media" | "baixa";
export type CostType = "fixo" | "variavel" | "emergencial" | "opcional";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  display_name: string;
  avatar_url?: string | null;
  person_key: Exclude<PersonKey, "ambos">;
  tutorial_completed_at?: string | null;
};

export type Couple = {
  id: string;
  name: string;
  created_by: string;
  default_currency: string;
  default_split_pedro: number;
  default_split_camilly: number;
  monthly_budget_pedro: number;
  monthly_budget_camilly: number;
  monthly_budget_shared: number;
  emergency_reserve_percent: number;
};

export type Trip = {
  id: string;
  couple_id: string;
  title: string;
  traveler_person: Exclude<PersonKey, "ambos">;
  host_person: Exclude<PersonKey, "ambos">;
  direction: string;
  origin_city: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  status: TripStatus;
  purpose?: string | null;
  planned_budget: number;
  priority: Priority;
  tickets_url?: string | null;
  accommodation_url?: string | null;
  itinerary_url?: string | null;
  ticket_deadline?: string | null;
  accommodation_deadline?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  couple_id: string | null;
  name: string;
  type: string;
  icon: string;
  color: string;
  is_default: boolean;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
};

export type PlannedExpense = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  owner_person: Exclude<PersonKey, "ambos">;
  expected_date?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  cost_type: CostType;
  description: string;
  planned_amount: number;
  min_amount?: number | null;
  max_amount?: number | null;
  probability: number;
  is_required: boolean;
  paid_by_person: PersonKey;
  beneficiary_person: PersonKey;
  payment_method?: string | null;
  is_installment: boolean;
  installment_count: number;
  status: string;
  notes?: string | null;
};

export type Expense = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  spent_at: string;
  paid_by_person: Exclude<PersonKey, "ambos">;
  beneficiary_person: PersonKey;
  category_id?: string | null;
  subcategory_id?: string | null;
  cost_type: CostType;
  description: string;
  amount: number;
  payment_method?: string | null;
  account_label?: string | null;
  is_installment: boolean;
  installment_count: number;
  current_installment: number;
  installment_amount: number;
  is_reimbursable: boolean;
  should_split: boolean;
  split_pedro_percent: number;
  split_camilly_percent: number;
  receipt_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  category?: Category | null;
  trip?: Trip | null;
};

export type ChecklistItem = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  title: string;
  category: string;
  responsible_person: PersonKey;
  due_date?: string | null;
  status: string;
  priority: Priority;
  is_done: boolean;
  notes?: string | null;
};

export type ItineraryItem = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  date: string;
  time?: string | null;
  activity: string;
  location?: string | null;
  category?: string | null;
  estimated_cost: number;
  actual_cost: number;
  responsible_person: PersonKey;
  requires_booking: boolean;
  booking_url?: string | null;
  status: string;
  notes?: string | null;
};

export type SavingsGoal = {
  id: string;
  couple_id: string;
  month: string;
  person: PersonKey;
  trip_id?: string | null;
  target_amount: number;
  saved_amount: number;
  notes?: string | null;
};

export type Installment = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  expense_id?: string | null;
  responsible_person: Exclude<PersonKey, "ambos">;
  description: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  current_installment: number;
  due_date: string;
  status: string;
  payment_method?: string | null;
  notes?: string | null;
};

export type Settlement = {
  id: string;
  couple_id: string;
  trip_id?: string | null;
  payer_person: Exclude<PersonKey, "ambos">;
  receiver_person: Exclude<PersonKey, "ambos">;
  amount: number;
  status: string;
  settled_at?: string | null;
  payment_method?: string | null;
  notes?: string | null;
};

export type DashboardData = {
  trips: Trip[];
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  checklistItems: ChecklistItem[];
  savingsGoals: SavingsGoal[];
  installments: Installment[];
  categories: Category[];
};

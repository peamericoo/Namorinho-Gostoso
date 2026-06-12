import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import type {
  Category,
  ChecklistItem,
  Couple,
  Expense,
  Installment,
  ItineraryItem,
  PlannedExpense,
  Profile,
  SavingsGoal,
  Settlement,
  Subcategory,
  Trip
} from "../types/models";

type Client = SupabaseClient<Database>;

function raise(error: unknown, fallback = "Não foi possível concluir a operação.") {
  if (!error) return;
  const message = typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message) : fallback;
  throw new Error(message || fallback);
}

export const tableNames = {
  trips: "trips",
  expenses: "expenses",
  plannedExpenses: "planned_expenses",
  checklistItems: "checklist_items",
  itineraryItems: "itinerary_items",
  savingsGoals: "savings_goals",
  installments: "installments",
  categories: "categories",
  subcategories: "subcategories",
  settlements: "settlements"
} as const;

export async function getCurrentWorkspace(client: Client = supabase) {
  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();
  raise(userError, "Não foi possível identificar o usuário.");
  if (!user) return null;

  const { data: profile, error: profileError } = await client.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  raise(profileError, "Não foi possível carregar seu perfil.");

  const { data: membership, error: memberError } = await client
    .from("couple_members")
    .select("id, couple_id, person_key, role, couples(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  raise(memberError, "Não foi possível carregar o espaço do casal.");

  const couple = (membership as unknown as { couples?: Couple })?.couples ?? null;
  return {
    user,
    profile: profile as Profile | null,
    couple,
    membership: membership as { id: string; couple_id: string; person_key: string; role: string } | null
  };
}

export async function setupProfileAndCouple(input: {
  userId: string;
  fullName: string;
  displayName: string;
  personKey: "pedro" | "camilly";
  coupleName: string;
}) {
  const { data: coupleId, error } = await supabase.rpc("create_workspace", {
    p_full_name: input.fullName,
    p_display_name: input.displayName,
    p_person_key: input.personKey,
    p_couple_name: input.coupleName
  });
  raise(error, "Não foi possível criar o espaço do casal.");
  return { id: coupleId, created_by: input.userId } as Couple;
}

export async function joinExistingWorkspace(input: {
  userId: string;
  fullName: string;
  displayName: string;
  personKey: "pedro" | "camilly";
  inviteCode: string;
}) {
  const { data: coupleId, error } = await supabase.rpc("join_workspace", {
    p_full_name: input.fullName,
    p_display_name: input.displayName,
    p_person_key: input.personKey,
    p_invite_code: input.inviteCode
  });
  raise(error, "Não foi possível entrar no espaço do casal.");
  return { id: coupleId, created_by: input.userId } as Couple;
}

export async function listTrips(coupleId: string) {
  const { data, error } = await supabase.from("trips").select("*").eq("couple_id", coupleId).order("start_date", { ascending: true });
  raise(error, "Não foi possível carregar as viagens.");
  return (data ?? []) as Trip[];
}

export async function getTrip(id: string) {
  const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
  raise(error, "Não foi possível carregar a viagem.");
  return data as Trip;
}

export async function createTrip(coupleId: string, values: Partial<Trip>) {
  const { data, error } = await supabase.from("trips").insert({ ...values, couple_id: coupleId }).select("*").single();
  raise(error, "Não foi possível criar a viagem.");
  return data as Trip;
}

export async function updateTrip(id: string, values: Partial<Trip>) {
  const { data, error } = await supabase.from("trips").update(values).eq("id", id).select("*").single();
  raise(error, "Não foi possível atualizar a viagem.");
  return data as Trip;
}

export async function deleteTrip(id: string) {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  raise(error, "Não foi possível excluir a viagem.");
}

export async function listCategories(coupleId: string) {
  const { data, error } = await supabase.from("categories").select("*").or(`couple_id.eq.${coupleId},couple_id.is.null`).order("name");
  raise(error, "Não foi possível carregar categorias.");
  return (data ?? []) as Category[];
}

export async function listSubcategories(categoryId?: string | null) {
  let query = supabase.from("subcategories").select("*").order("name");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  raise(error, "Não foi possível carregar subcategorias.");
  return (data ?? []) as Subcategory[];
}

export async function createCategory(coupleId: string, values: { name: string; icon: string; color: string; subcategory?: string | null }) {
  const { data: category, error } = await supabase
    .from("categories")
    .insert({ couple_id: coupleId, name: values.name, icon: values.icon, color: values.color, type: "expense", is_default: false })
    .select("*")
    .single();
  if (!category) throw new Error("Nao foi possivel criar a categoria.");
  raise(error, "Não foi possível criar a categoria.");
  if (values.subcategory) {
    const { error: subError } = await supabase.from("subcategories").insert({ category_id: category.id, name: values.subcategory });
    raise(subError, "Categoria criada, mas a subcategoria não foi salva.");
  }
  return category as Category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id).eq("is_default", false);
  raise(error, "Não foi possível excluir a categoria.");
}

export async function listExpenses(coupleId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, category:categories(*), trip:trips(*)")
    .eq("couple_id", coupleId)
    .order("spent_at", { ascending: false });
  raise(error, "Não foi possível carregar os gastos.");
  return (data ?? []) as unknown as Expense[];
}

export async function getExpense(id: string) {
  const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single();
  raise(error, "Não foi possível carregar o gasto.");
  return data as Expense;
}

export async function createExpense(coupleId: string, values: Partial<Expense>) {
  const { data, error } = await supabase.from("expenses").insert({ ...values, couple_id: coupleId }).select("*").single();
  raise(error, "Não foi possível registrar o gasto.");
  return data as Expense;
}

export async function updateExpense(id: string, values: Partial<Expense>) {
  const { data, error } = await supabase.from("expenses").update(values).eq("id", id).select("*").single();
  raise(error, "Não foi possível atualizar o gasto.");
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  raise(error, "Não foi possível excluir o gasto.");
}

export async function uploadReceipt(coupleId: string, expenseId: string, file: { uri: string; name: string; mimeType?: string | null }) {
  if (!expenseId || expenseId === "novo-gasto") {
    throw new Error("Salve o gasto antes de enviar o comprovante.");
  }
  const response = await fetch(file.uri);
  const blob = await response.blob();
  const path = `${coupleId}/${expenseId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from("receipts").upload(path, blob, {
    contentType: file.mimeType ?? "application/octet-stream",
    upsert: true
  });
  if (!data) throw new Error("Nao foi possivel enviar o comprovante.");
  raise(error, "Não foi possível enviar o comprovante.");
  return data.path;
}

export async function signedReceiptUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 10);
  if (!data) throw new Error("Nao foi possivel abrir o comprovante.");
  raise(error, "Não foi possível abrir o comprovante.");
  return data.signedUrl;
}

export async function listPlannedExpenses(coupleId: string) {
  const { data, error } = await supabase.from("planned_expenses").select("*").eq("couple_id", coupleId).order("expected_date", { ascending: true });
  raise(error, "Não foi possível carregar os custos planejados.");
  return (data ?? []) as PlannedExpense[];
}

export async function createPlannedExpense(coupleId: string, values: Partial<PlannedExpense>) {
  const { data, error } = await supabase.from("planned_expenses").insert({ ...values, couple_id: coupleId }).select("*").single();
  raise(error, "Não foi possível criar o custo planejado.");
  return data as PlannedExpense;
}

export async function updatePlannedExpense(id: string, values: Partial<PlannedExpense>) {
  const { data, error } = await supabase.from("planned_expenses").update(values).eq("id", id).select("*").single();
  raise(error, "Não foi possível atualizar o custo planejado.");
  return data as PlannedExpense;
}

export async function deletePlannedExpense(id: string) {
  const { error } = await supabase.from("planned_expenses").delete().eq("id", id);
  raise(error, "Não foi possível excluir o custo planejado.");
}

export async function listChecklistItems(coupleId: string) {
  const { data, error } = await supabase.from("checklist_items").select("*").eq("couple_id", coupleId).order("due_date", { ascending: true });
  raise(error, "Não foi possível carregar o checklist.");
  return (data ?? []) as ChecklistItem[];
}

export async function upsertChecklistItem(coupleId: string, values: Partial<ChecklistItem>) {
  const payload = { ...values, couple_id: coupleId };
  const query = values.id ? supabase.from("checklist_items").update(payload).eq("id", values.id) : supabase.from("checklist_items").insert(payload);
  const { data, error } = await query.select("*").single();
  raise(error, "Não foi possível salvar o item.");
  return data as ChecklistItem;
}

export async function deleteChecklistItem(id: string) {
  const { error } = await supabase.from("checklist_items").delete().eq("id", id);
  raise(error, "Não foi possível excluir o item.");
}

export async function listItineraryItems(coupleId: string) {
  const { data, error } = await supabase.from("itinerary_items").select("*").eq("couple_id", coupleId).order("date", { ascending: true });
  raise(error, "Não foi possível carregar o roteiro.");
  return (data ?? []) as ItineraryItem[];
}

export async function upsertItineraryItem(coupleId: string, values: Partial<ItineraryItem>) {
  const payload = { ...values, couple_id: coupleId };
  const query = values.id ? supabase.from("itinerary_items").update(payload).eq("id", values.id) : supabase.from("itinerary_items").insert(payload);
  const { data, error } = await query.select("*").single();
  raise(error, "Não foi possível salvar a atividade.");
  return data as ItineraryItem;
}

export async function deleteItineraryItem(id: string) {
  const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
  raise(error, "Não foi possível excluir a atividade.");
}

export async function listSavingsGoals(coupleId: string) {
  const { data, error } = await supabase.from("savings_goals").select("*").eq("couple_id", coupleId).order("month", { ascending: false });
  raise(error, "Não foi possível carregar metas.");
  return (data ?? []) as SavingsGoal[];
}

export async function upsertSavingsGoal(coupleId: string, values: Partial<SavingsGoal>) {
  const payload = { ...values, couple_id: coupleId };
  const query = values.id ? supabase.from("savings_goals").update(payload).eq("id", values.id) : supabase.from("savings_goals").insert(payload);
  const { data, error } = await query.select("*").single();
  raise(error, "Não foi possível salvar a meta.");
  return data as SavingsGoal;
}

export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  raise(error, "Não foi possível excluir a meta.");
}

export async function listInstallments(coupleId: string) {
  const { data, error } = await supabase.from("installments").select("*").eq("couple_id", coupleId).order("due_date", { ascending: true });
  raise(error, "Não foi possível carregar parcelamentos.");
  return (data ?? []) as Installment[];
}

export async function upsertInstallment(coupleId: string, values: Partial<Installment>) {
  const payload = { ...values, couple_id: coupleId };
  const query = values.id ? supabase.from("installments").update(payload).eq("id", values.id) : supabase.from("installments").insert(payload);
  const { data, error } = await query.select("*").single();
  raise(error, "Não foi possível salvar o parcelamento.");
  return data as Installment;
}

export async function deleteInstallment(id: string) {
  const { error } = await supabase.from("installments").delete().eq("id", id);
  raise(error, "Não foi possível excluir o parcelamento.");
}

export async function listSettlements(coupleId: string) {
  const { data, error } = await supabase.from("settlements").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false });
  raise(error, "Não foi possível carregar acertos.");
  return (data ?? []) as Settlement[];
}

export async function createSettlement(coupleId: string, values: Partial<Settlement>) {
  const { data, error } = await supabase.from("settlements").insert({ ...values, couple_id: coupleId }).select("*").single();
  raise(error, "Não foi possível registrar o acerto.");
  return data as Settlement;
}

export async function updateCouple(coupleId: string, values: Partial<Couple>) {
  const { data, error } = await supabase.from("couples").update(values).eq("id", coupleId).select("*").single();
  raise(error, "Não foi possível salvar configurações.");
  return data as Couple;
}

export async function updateProfile(userId: string, values: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(values).eq("user_id", userId).select("*").single();
  raise(error, "Não foi possível salvar perfil.");
  return data as Profile;
}

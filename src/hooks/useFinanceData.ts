import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  createCategory,
  createExpense,
  createPlannedExpense,
  createSettlement,
  createTrip,
  deleteCategory,
  deleteChecklistItem,
  deleteExpense,
  deleteInstallment,
  deleteItineraryItem,
  deletePlannedExpense,
  deleteSavingsGoal,
  deleteTrip,
  getExpense,
  getTrip,
  listCategories,
  listChecklistItems,
  listExpenses,
  listInstallments,
  listItineraryItems,
  listPlannedExpenses,
  listSavingsGoals,
  listSettlements,
  listSubcategories,
  listTrips,
  updateCouple,
  updateExpense,
  updatePlannedExpense,
  updateProfile,
  updateTrip,
  upsertChecklistItem,
  upsertInstallment,
  upsertItineraryItem,
  upsertSavingsGoal
} from "../services/finance.service";
import type { ChecklistItem, Couple, Expense, Installment, ItineraryItem, PlannedExpense, Profile, SavingsGoal, Settlement, Trip } from "../types/models";
import { useWorkspace } from "./useWorkspace";

const realtimeSubscriptions = new Map<string, { count: number; unsubscribe: () => void }>();
const realtimeTables = [
  "trips",
  "expenses",
  "planned_expenses",
  "settlements",
  "checklist_items",
  "itinerary_items",
  "savings_goals",
  "installments",
  "categories",
  "app_settings"
];

function useCoupleId() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const coupleId = workspace.data?.couple?.id ?? null;

  useEffect(() => {
    if (!coupleId) return;
    const existing = realtimeSubscriptions.get(coupleId);
    if (existing) {
      existing.count += 1;
      return () => {
        const current = realtimeSubscriptions.get(coupleId);
        if (!current) return;
        current.count -= 1;
        if (current.count <= 0) {
          current.unsubscribe();
          realtimeSubscriptions.delete(coupleId);
        }
      };
    }

    const channel = supabase.channel(`finance:${coupleId}`);
    realtimeTables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `couple_id=eq.${coupleId}` },
        () => invalidateFinance(queryClient)
      );
    });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "subcategories" }, () => invalidateFinance(queryClient));
    void channel.subscribe();
    realtimeSubscriptions.set(coupleId, { count: 1, unsubscribe: () => void supabase.removeChannel(channel) });

    return () => {
      const current = realtimeSubscriptions.get(coupleId);
      if (!current) return;
      current.count -= 1;
      if (current.count <= 0) {
        current.unsubscribe();
        realtimeSubscriptions.delete(coupleId);
      }
    };
  }, [coupleId, queryClient]);

  return coupleId;
}

function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["finance"] });
  void queryClient.invalidateQueries({ queryKey: ["workspace"] });
}

export function useTrips() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "trips", coupleId], queryFn: () => listTrips(coupleId!), enabled: Boolean(coupleId) });
}

export function useTrip(id?: string) {
  return useQuery({ queryKey: ["finance", "trip", id], queryFn: () => getTrip(id!), enabled: Boolean(id) });
}

export function useTripMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: (values: Partial<Trip>) => createTrip(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    update: useMutation({ mutationFn: ({ id, values }: { id: string; values: Partial<Trip> }) => updateTrip(id, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteTrip, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useCategories() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "categories", coupleId], queryFn: () => listCategories(coupleId!), enabled: Boolean(coupleId) });
}

export function useSubcategories(categoryId?: string | null) {
  return useQuery({ queryKey: ["finance", "subcategories", categoryId], queryFn: () => listSubcategories(categoryId), enabled: true });
}

export function useCategoryMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: (values: { name: string; icon: string; color: string; subcategory?: string | null }) => createCategory(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteCategory, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useExpenses() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "expenses", coupleId], queryFn: () => listExpenses(coupleId!), enabled: Boolean(coupleId) });
}

export function useExpense(id?: string) {
  return useQuery({ queryKey: ["finance", "expense", id], queryFn: () => getExpense(id!), enabled: Boolean(id) });
}

export function useExpenseMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: (values: Partial<Expense>) => createExpense(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    update: useMutation({ mutationFn: ({ id, values }: { id: string; values: Partial<Expense> }) => updateExpense(id, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteExpense, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function usePlannedExpenses() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "planned-expenses", coupleId], queryFn: () => listPlannedExpenses(coupleId!), enabled: Boolean(coupleId) });
}

export function usePlannedExpenseMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: (values: Partial<PlannedExpense>) => createPlannedExpense(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    update: useMutation({ mutationFn: ({ id, values }: { id: string; values: Partial<PlannedExpense> }) => updatePlannedExpense(id, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deletePlannedExpense, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useChecklistItems() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "checklist", coupleId], queryFn: () => listChecklistItems(coupleId!), enabled: Boolean(coupleId) });
}

export function useChecklistMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    save: useMutation({ mutationFn: (values: Partial<ChecklistItem>) => upsertChecklistItem(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteChecklistItem, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useItineraryItems() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "itinerary", coupleId], queryFn: () => listItineraryItems(coupleId!), enabled: Boolean(coupleId) });
}

export function useItineraryMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    save: useMutation({ mutationFn: (values: Partial<ItineraryItem>) => upsertItineraryItem(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteItineraryItem, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useSavingsGoals() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "savings", coupleId], queryFn: () => listSavingsGoals(coupleId!), enabled: Boolean(coupleId) });
}

export function useSavingsMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    save: useMutation({ mutationFn: (values: Partial<SavingsGoal>) => upsertSavingsGoal(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteSavingsGoal, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useInstallments() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "installments", coupleId], queryFn: () => listInstallments(coupleId!), enabled: Boolean(coupleId) });
}

export function useInstallmentMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    save: useMutation({ mutationFn: (values: Partial<Installment>) => upsertInstallment(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) }),
    remove: useMutation({ mutationFn: deleteInstallment, onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useSettlements() {
  const coupleId = useCoupleId();
  return useQuery({ queryKey: ["finance", "settlements", coupleId], queryFn: () => listSettlements(coupleId!), enabled: Boolean(coupleId) });
}

export function useSettlementMutations() {
  const coupleId = useCoupleId();
  const queryClient = useQueryClient();
  return {
    create: useMutation({ mutationFn: (values: Partial<Settlement>) => createSettlement(coupleId!, values), onSuccess: () => invalidateFinance(queryClient) })
  };
}

export function useSettingsMutations() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  return {
    updateCouple: useMutation({ mutationFn: (values: Partial<Couple>) => updateCouple(workspace.data!.couple!.id, values), onSuccess: () => invalidateFinance(queryClient) }),
    updateProfile: useMutation({ mutationFn: (values: Partial<Profile>) => updateProfile(workspace.data!.user.id, values), onSuccess: () => invalidateFinance(queryClient) })
  };
}

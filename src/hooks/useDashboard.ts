import { useMemo } from "react";
import { calculateSettlement, plannedByTrip, savingsOverview, smartAlerts, sum, tripSummary } from "../lib/calculations";
import { getCurrentOrNextTrip, getLastCompletedTrip } from "../lib/tripLifecycle";
import { useChecklistItems, useExpenses, useInstallments, usePlannedExpenses, useSavingsGoals, useTrips, useCategories, useSettlements } from "./useFinanceData";

export function useDashboard() {
  const trips = useTrips();
  const expenses = useExpenses();
  const plannedExpenses = usePlannedExpenses();
  const checklistItems = useChecklistItems();
  const savingsGoals = useSavingsGoals();
  const installments = useInstallments();
  const categories = useCategories();
  const settlements = useSettlements();
  const isLoading = trips.isLoading || expenses.isLoading || plannedExpenses.isLoading || checklistItems.isLoading || savingsGoals.isLoading || installments.isLoading || settlements.isLoading;

  const data = useMemo(() => {
    const tripRows = trips.data ?? [];
    const expenseRows = expenses.data ?? [];
    const plannedRows = plannedExpenses.data ?? [];
    const checklistRows = checklistItems.data ?? [];
    const savingsRows = savingsGoals.data ?? [];
    const installmentRows = installments.data ?? [];
    const categoryRows = categories.data ?? [];
    const settlementRows = settlements.data ?? [];
    const now = new Date();
    const settlement = calculateSettlement(expenseRows, settlementRows);
    const totalPlanned = sum(tripRows.map((trip) => trip.planned_budget || plannedByTrip(trip.id, plannedRows)));
    const totalSpent = sum(expenseRows.map((expense) => expense.amount));
    const upcomingTrip = getCurrentOrNextTrip(tripRows, now);
    const lastCompletedTrip = getLastCompletedTrip(tripRows, now);

    return {
      trips: tripRows,
      expenses: expenseRows,
      plannedExpenses: plannedRows,
      checklistItems: checklistRows,
      savingsGoals: savingsRows,
      installments: installmentRows,
      settlements: settlementRows,
      categories: categoryRows,
      totalPlanned,
      totalSpent,
      plannedVsActual: totalPlanned - totalSpent,
      settlement,
      savings: savingsOverview(savingsRows),
      upcomingTrip,
      lastCompletedTrip,
      tripSummaries: tripRows.map((trip) => ({ trip, ...tripSummary(trip, expenseRows, plannedRows) })),
      alerts: smartAlerts({
        trips: tripRows,
        expenses: expenseRows,
        plannedExpenses: plannedRows,
        checklistItems: checklistRows,
        installments: installmentRows,
        savingsGoals: savingsRows,
        settlements: settlementRows,
        referenceDate: now
      })
    };
  }, [categories.data, checklistItems.data, expenses.data, installments.data, plannedExpenses.data, savingsGoals.data, settlements.data, trips.data]);

  return { data, isLoading, error: trips.error || expenses.error || plannedExpenses.error || settlements.error };
}

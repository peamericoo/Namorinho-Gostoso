import { useMemo } from "react";
import { calculateSettlement, plannedByTrip, savingsOverview, smartAlerts, sum, tripSummary } from "../lib/calculations";
import { useChecklistItems, useExpenses, useInstallments, usePlannedExpenses, useSavingsGoals, useTrips, useCategories } from "./useFinanceData";

export function useDashboard() {
  const trips = useTrips();
  const expenses = useExpenses();
  const plannedExpenses = usePlannedExpenses();
  const checklistItems = useChecklistItems();
  const savingsGoals = useSavingsGoals();
  const installments = useInstallments();
  const categories = useCategories();
  const isLoading = trips.isLoading || expenses.isLoading || plannedExpenses.isLoading || checklistItems.isLoading || savingsGoals.isLoading || installments.isLoading;

  const data = useMemo(() => {
    const tripRows = trips.data ?? [];
    const expenseRows = expenses.data ?? [];
    const plannedRows = plannedExpenses.data ?? [];
    const checklistRows = checklistItems.data ?? [];
    const savingsRows = savingsGoals.data ?? [];
    const installmentRows = installments.data ?? [];
    const categoryRows = categories.data ?? [];
    const settlement = calculateSettlement(expenseRows);
    const totalPlanned = sum(tripRows.map((trip) => trip.planned_budget || plannedByTrip(trip.id, plannedRows)));
    const totalSpent = sum(expenseRows.map((expense) => expense.amount));
    const upcomingTrip = tripRows.find((trip) => trip.status !== "concluida" && new Date(trip.start_date) >= new Date()) ?? tripRows[0];

    return {
      trips: tripRows,
      expenses: expenseRows,
      plannedExpenses: plannedRows,
      checklistItems: checklistRows,
      savingsGoals: savingsRows,
      installments: installmentRows,
      categories: categoryRows,
      totalPlanned,
      totalSpent,
      plannedVsActual: totalPlanned - totalSpent,
      settlement,
      savings: savingsOverview(savingsRows),
      upcomingTrip,
      tripSummaries: tripRows.map((trip) => ({ trip, ...tripSummary(trip, expenseRows, plannedRows) })),
      alerts: smartAlerts({
        trips: tripRows,
        expenses: expenseRows,
        plannedExpenses: plannedRows,
        checklistItems: checklistRows,
        installments: installmentRows,
        savingsGoals: savingsRows
      })
    };
  }, [categories.data, checklistItems.data, expenses.data, installments.data, plannedExpenses.data, savingsGoals.data, trips.data]);

  return { data, isLoading, error: trips.error || expenses.error || plannedExpenses.error };
}

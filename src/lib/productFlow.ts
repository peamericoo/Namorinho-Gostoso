import { differenceInCalendarDays, parseISO } from "date-fns";
import { labelPerson } from "../constants/categories";
import { actualByTrip, plannedByTrip } from "./calculations";
import type { ChecklistItem, Expense, PlannedExpense, Trip } from "../types/models";

export function buildTripDirection(traveler?: string | null, host?: string | null) {
  return `${labelPerson(traveler)} visita ${labelPerson(host)}`;
}

export function tripDirectionChip(trip: Pick<Trip, "traveler_person" | "host_person">) {
  return `${labelPerson(trip.traveler_person)} → ${labelPerson(trip.host_person)}`;
}

export function daysUntilTrip(trip?: Pick<Trip, "start_date"> | null) {
  if (!trip?.start_date) return null;
  return differenceInCalendarDays(parseISO(trip.start_date), new Date());
}

export function tripPlannedAmount(trip: Trip, plannedExpenses: PlannedExpense[]) {
  return trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
}

export function tripBudgetProgress(trip: Trip, expenses: Expense[], plannedExpenses: PlannedExpense[]) {
  const planned = tripPlannedAmount(trip, plannedExpenses);
  const actual = actualByTrip(trip.id, expenses);
  return planned > 0 ? Math.min(actual / planned, 1.25) : 0;
}

export function tripChecklistProgress(trip: Trip, checklistItems: ChecklistItem[]) {
  const items = checklistItems.filter((item) => item.trip_id === trip.id);
  if (!items.length) return 0;
  return items.filter((item) => item.is_done).length / items.length;
}

export function hasPlannedCosts(trip: Trip | null | undefined, plannedExpenses: PlannedExpense[]) {
  if (!trip) return false;
  return trip.planned_budget > 0 || plannedExpenses.some((expense) => expense.trip_id === trip.id);
}

export function hasChecklistForTrip(trip: Trip | null | undefined, checklistItems: ChecklistItem[]) {
  if (!trip) return false;
  return checklistItems.some((item) => item.trip_id === trip.id);
}

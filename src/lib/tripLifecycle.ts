import { format } from "date-fns";
import type { Trip, TripStatus } from "../types/models";

type TripLifecycleFields = Pick<Trip, "start_date" | "end_date" | "status">;
type WritableTripLifecycleFields = Partial<TripLifecycleFields>;

function referenceISO(referenceDate: Date | string) {
  return typeof referenceDate === "string" ? referenceDate.slice(0, 10) : format(referenceDate, "yyyy-MM-dd");
}

function dateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function isManualTripStatus(status?: string | null): status is "cancelada" | "adiada" {
  return status === "cancelada" || status === "adiada";
}

export function deriveTripStatusFromDates(startDate?: string | null, endDate?: string | null, referenceDate: Date | string = new Date()): TripStatus {
  const today = referenceISO(referenceDate);
  const start = dateOnly(startDate);
  const end = dateOnly(endDate);

  if (end && end < today) return "concluida";
  if (start && start > today) return "planejada";
  if (start && end && start <= today && end >= today) return "em_andamento";

  return "planejada";
}

export function getEffectiveTripStatus(trip: TripLifecycleFields, referenceDate: Date | string = new Date()): TripStatus {
  if (isManualTripStatus(trip.status)) return trip.status;
  return deriveTripStatusFromDates(trip.start_date, trip.end_date, referenceDate);
}

export function normalizeTripForWrite<T extends WritableTripLifecycleFields>(values: T, referenceDate: Date | string = new Date()): T {
  if (isManualTripStatus(values.status)) return values;
  if (!values.start_date || !values.end_date) return values;

  return {
    ...values,
    status: deriveTripStatusFromDates(values.start_date, values.end_date, referenceDate)
  };
}

export function getCurrentOrNextTrip<T extends TripLifecycleFields>(trips: T[], referenceDate: Date | string = new Date()) {
  const active = trips
    .filter((trip) => getEffectiveTripStatus(trip, referenceDate) === "em_andamento")
    .sort((a, b) => dateOnly(a.start_date).localeCompare(dateOnly(b.start_date)))[0];

  if (active) return active;

  return trips
    .filter((trip) => getEffectiveTripStatus(trip, referenceDate) === "planejada")
    .sort((a, b) => dateOnly(a.start_date).localeCompare(dateOnly(b.start_date)))[0];
}

export function getLastCompletedTrip<T extends TripLifecycleFields>(trips: T[], referenceDate: Date | string = new Date()) {
  return trips
    .filter((trip) => getEffectiveTripStatus(trip, referenceDate) === "concluida")
    .sort((a, b) => dateOnly(b.end_date).localeCompare(dateOnly(a.end_date)))[0];
}

export function showsTripPreparationStatus(status: TripStatus) {
  return status === "planejada" || status === "em_andamento";
}

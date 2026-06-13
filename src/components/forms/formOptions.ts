import { costTypes, labelPerson, labelStatus, labelTripKind, paymentMethods, priorities, tripKinds, tripStatuses } from "../../constants/categories";
import { dateBR } from "../../lib/formatters";
import { getEffectiveTripStatus } from "../../lib/tripLifecycle";
import type { Category, PersonKey, Trip } from "../../types/models";

export const personOptions = [
  { label: "Pedro", value: "pedro" },
  { label: "Camilly", value: "camilly" }
];

export const personWithBothOptions = [
  ...personOptions,
  { label: "Ambos", value: "ambos" }
];

export const priorityOptions = priorities.map((value) => ({ value, label: labelStatus(value) }));
export const statusOptions = tripStatuses.map((value) => ({ value, label: labelStatus(value) }));
export const tripKindOptions = tripKinds.map((value) => ({ value, label: labelTripKind(value) }));
export const costTypeOptions = costTypes.map((value) => ({ value, label: labelStatus(value) }));
export const paymentOptions = paymentMethods.map((value) => ({ value, label: value }));
export const yesNoOptions = [
  { label: "Sim", value: "true" },
  { label: "Não", value: "false" }
];

export function tripOptions(trips: Trip[]) {
  return trips.map((trip) => ({
    label: `${trip.title} · ${dateBR(trip.start_date)} · ${labelStatus(getEffectiveTripStatus(trip))}`,
    value: trip.id
  }));
}

export function categoryOptions(categories: Category[]) {
  return categories.map((category) => ({ label: category.name, value: category.id }));
}

export function personLabel(value?: PersonKey | string | null) {
  return labelPerson(value);
}

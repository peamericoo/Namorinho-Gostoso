import { differenceInCalendarDays, isAfter, parseISO } from "date-fns";

export function daysTogether(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  return Math.max(differenceInCalendarDays(parseISO(end), parseISO(start)) + 1, 1);
}

export function isDateAfter(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return isAfter(parseISO(a), parseISO(b));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PersonKey } from "../types/models";

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function money(value?: number | null) {
  return currencyFormatter.format(Number(value ?? 0));
}

export function percent(value?: number | null) {
  return `${Number(value ?? 0).toFixed(0)}%`;
}

export function dateBR(value?: string | Date | null) {
  if (!value) return "Sem data";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function monthBR(value?: string | Date | null) {
  if (!value) return "Sem mês";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMM/yyyy", { locale: ptBR });
}

export function personName(person: PersonKey | string | null | undefined) {
  if (person === "pedro") return "Pedro";
  if (person === "camilly") return "Camilly";
  return "Ambos";
}

export function compactText(text?: string | null, max = 80) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

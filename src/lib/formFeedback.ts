import type { FieldErrors } from "react-hook-form";

export function buildFormErrorSummary<T extends Record<string, any>>(errors: FieldErrors<T>, labels: Record<string, string>) {
  const fields = Object.keys(labels).filter((field) => errors[field as keyof typeof errors]);
  if (!fields.length) return "Revise os campos destacados antes de salvar.";

  const visibleLabels = fields.slice(0, 5).map((field) => labels[field]).join(", ");
  const suffix = fields.length > 5 ? ` e mais ${fields.length - 5}` : "";
  return `Revise os campos: ${visibleLabels}${suffix}.`;
}

export function submitErrorMessage(error: unknown, fallback = "Não foi possível salvar. Tente novamente.") {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

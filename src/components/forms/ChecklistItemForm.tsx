import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { buildFormErrorSummary, submitErrorMessage } from "../../lib/formFeedback";
import { checklistSchema } from "../../lib/validators";
import type { ChecklistItem, Trip } from "../../types/models";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { personWithBothOptions, priorityOptions, tripOptions, yesNoOptions } from "./formOptions";

type InputValues = z.input<typeof checklistSchema>;
type Values = z.output<typeof checklistSchema>;

const fieldLabels: Record<string, string> = {
  trip_id: "viagem",
  title: "item",
  category: "categoria",
  responsible_person: "responsável",
  status: "status",
  priority: "prioridade"
};

export function ChecklistItemForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<ChecklistItem>; onSubmit: (values: Values) => void | Promise<void>; loading?: boolean }) {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? trips[0]?.id ?? "",
      title: initialValues?.title ?? "",
      category: initialValues?.category ?? "Geral",
      responsible_person: initialValues?.responsible_person ?? "ambos",
      due_date: initialValues?.due_date ?? "",
      status: initialValues?.status ?? "pendente",
      priority: initialValues?.priority ?? "media",
      is_done: initialValues?.is_done ?? false,
      notes: initialValues?.notes ?? ""
    } as InputValues
  });
  const errors = form.formState.errors;

  async function submit(values: Values) {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(submitErrorMessage(err, "Não foi possível salvar o item."));
    }
  }

  function submitInvalid(formErrors: FieldErrors<InputValues>) {
    setSubmitError(buildFormErrorSummary(formErrors, fieldLabels));
  }

  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} required />} />
      <Controller control={form.control} name="title" render={({ field }) => <Input label="Item" value={field.value} onChangeText={field.onChange} error={errors.title?.message} required />} />
      <Controller control={form.control} name="category" render={({ field }) => <Input label="Categoria" value={field.value} onChangeText={field.onChange} error={errors.category?.message} required />} />
      <Controller control={form.control} name="responsible_person" render={({ field }) => <Select label="Responsável" value={field.value} onChange={field.onChange} options={personWithBothOptions} error={errors.responsible_person?.message} required />} />
      <Controller control={form.control} name="due_date" render={({ field }) => <DateInput label="Prazo" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} error={errors.status?.message} required />} />
      <Controller control={form.control} name="priority" render={({ field }) => <Select label="Prioridade" value={field.value} onChange={field.onChange} options={priorityOptions} error={errors.priority?.message} required />} />
      <Controller control={form.control} name="is_done" render={({ field }) => <Select label="Concluído?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      {submitError ? <AlertBanner tone="danger" message={submitError} /> : null}
      <Button title="Salvar item" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submit, submitInvalid)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

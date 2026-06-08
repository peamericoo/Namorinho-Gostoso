import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { checklistSchema } from "../../lib/validators";
import type { ChecklistItem, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { personWithBothOptions, priorityOptions, tripOptions, yesNoOptions } from "./formOptions";

type InputValues = z.input<typeof checklistSchema>;
type Values = z.output<typeof checklistSchema>;

export function ChecklistItemForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<ChecklistItem>; onSubmit: (values: Values) => void; loading?: boolean }) {
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
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} />} />
      <Controller control={form.control} name="title" render={({ field }) => <Input label="Item" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />} />
      <Controller control={form.control} name="category" render={({ field }) => <Input label="Categoria" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="responsible_person" render={({ field }) => <Select label="Responsável" value={field.value} onChange={field.onChange} options={personWithBothOptions} />} />
      <Controller control={form.control} name="due_date" render={({ field }) => <DateInput label="Prazo" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="priority" render={({ field }) => <Select label="Prioridade" value={field.value} onChange={field.onChange} options={priorityOptions} />} />
      <Controller control={form.control} name="is_done" render={({ field }) => <Select label="Concluído?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar item" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

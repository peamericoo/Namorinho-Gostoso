import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { todayISO } from "../../lib/dates";
import { buildFormErrorSummary, submitErrorMessage } from "../../lib/formFeedback";
import { itinerarySchema } from "../../lib/validators";
import type { ItineraryItem, Trip } from "../../types/models";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personWithBothOptions, tripOptions, yesNoOptions } from "./formOptions";

type InputValues = z.input<typeof itinerarySchema>;
type Values = z.output<typeof itinerarySchema>;

const fieldLabels: Record<string, string> = {
  trip_id: "viagem",
  date: "data",
  activity: "atividade",
  estimated_cost: "custo estimado",
  actual_cost: "custo real",
  responsible_person: "responsável",
  status: "status"
};

export function ItineraryItemForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<ItineraryItem>; onSubmit: (values: Values) => void | Promise<void>; loading?: boolean }) {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? trips[0]?.id ?? "",
      date: initialValues?.date ?? todayISO(),
      time: initialValues?.time ?? "",
      activity: initialValues?.activity ?? "",
      location: initialValues?.location ?? "",
      category: initialValues?.category ?? "Lazer",
      estimated_cost: initialValues?.estimated_cost ?? 0,
      actual_cost: initialValues?.actual_cost ?? 0,
      responsible_person: initialValues?.responsible_person ?? "ambos",
      requires_booking: initialValues?.requires_booking ?? false,
      booking_url: initialValues?.booking_url ?? "",
      status: initialValues?.status ?? "planejado",
      notes: initialValues?.notes ?? ""
    } as InputValues
  });
  const errors = form.formState.errors;

  async function submit(values: Values) {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(submitErrorMessage(err, "Não foi possível salvar a atividade."));
    }
  }

  function submitInvalid(formErrors: FieldErrors<InputValues>) {
    setSubmitError(buildFormErrorSummary(formErrors, fieldLabels));
  }

  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} required />} />
      <Controller control={form.control} name="date" render={({ field }) => <DateInput label="Data" value={field.value} onChangeText={field.onChange} error={errors.date?.message} required />} />
      <Controller control={form.control} name="time" render={({ field }) => <Input label="Horário" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="activity" render={({ field }) => <Input label="Atividade" value={field.value} onChangeText={field.onChange} error={errors.activity?.message} required />} />
      <Controller control={form.control} name="location" render={({ field }) => <Input label="Local" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="category" render={({ field }) => <Input label="Categoria" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="estimated_cost" render={({ field }) => <MoneyInput label="Custo estimado" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.estimated_cost?.message} required />} />
        <Controller control={form.control} name="actual_cost" render={({ field }) => <MoneyInput label="Custo real" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.actual_cost?.message} required />} />
      </View>
      <Controller control={form.control} name="responsible_person" render={({ field }) => <Select label="Responsável" value={field.value} onChange={field.onChange} options={personWithBothOptions} error={errors.responsible_person?.message} required />} />
      <Controller control={form.control} name="requires_booking" render={({ field }) => <Select label="Reserva necessária?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      <Controller control={form.control} name="booking_url" render={({ field }) => <Input label="Link da reserva" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} error={errors.status?.message} required />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      {submitError ? <AlertBanner tone="danger" message={submitError} /> : null}
      <Button title="Salvar atividade" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submit, submitInvalid)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md }, grid: { gap: theme.spacing.md } });

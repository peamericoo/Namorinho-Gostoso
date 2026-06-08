import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { itinerarySchema } from "../../lib/validators";
import type { ItineraryItem, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personWithBothOptions, tripOptions, yesNoOptions } from "./formOptions";

type InputValues = z.input<typeof itinerarySchema>;
type Values = z.output<typeof itinerarySchema>;

export function ItineraryItemForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<ItineraryItem>; onSubmit: (values: Values) => void; loading?: boolean }) {
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? trips[0]?.id ?? "",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
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
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} />} />
      <Controller control={form.control} name="date" render={({ field }) => <DateInput label="Data" value={field.value} onChangeText={field.onChange} error={errors.date?.message} />} />
      <Controller control={form.control} name="time" render={({ field }) => <Input label="Horário" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="activity" render={({ field }) => <Input label="Atividade" value={field.value} onChangeText={field.onChange} error={errors.activity?.message} />} />
      <Controller control={form.control} name="location" render={({ field }) => <Input label="Local" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="category" render={({ field }) => <Input label="Categoria" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="estimated_cost" render={({ field }) => <MoneyInput label="Custo estimado" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="actual_cost" render={({ field }) => <MoneyInput label="Custo real" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      </View>
      <Controller control={form.control} name="responsible_person" render={({ field }) => <Select label="Responsável" value={field.value} onChange={field.onChange} options={personWithBothOptions} />} />
      <Controller control={form.control} name="requires_booking" render={({ field }) => <Select label="Reserva necessária?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      <Controller control={form.control} name="booking_url" render={({ field }) => <Input label="Link da reserva" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar atividade" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md }, grid: { gap: theme.spacing.md } });

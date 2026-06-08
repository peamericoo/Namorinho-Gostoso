import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { tripSchema } from "../../lib/validators";
import type { Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personOptions, priorityOptions, statusOptions } from "./formOptions";

type TripFormInput = z.input<typeof tripSchema>;
type TripFormValues = z.output<typeof tripSchema>;

const defaults: TripFormInput = {
  title: "",
  traveler_person: "pedro",
  host_person: "camilly",
  direction: "Pedro visita Camilly",
  origin_city: "",
  destination_city: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  status: "planejada",
  purpose: "",
  planned_budget: 0,
  priority: "media",
  tickets_url: "",
  accommodation_url: "",
  itinerary_url: "",
  ticket_deadline: "",
  accommodation_deadline: "",
  notes: ""
};

export function TripForm({ initialValues, onSubmit, loading }: { initialValues?: Partial<Trip>; onSubmit: (values: TripFormValues) => void; loading?: boolean }) {
  const form = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: { ...defaults, ...initialValues } as TripFormInput
  });
  const errors = form.formState.errors;
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="title" render={({ field }) => <Input label="Nome da viagem" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="traveler_person" render={({ field }) => <Select label="Pessoa viajando" value={field.value} onChange={field.onChange} options={personOptions} error={errors.traveler_person?.message} />} />
        <Controller control={form.control} name="host_person" render={({ field }) => <Select label="Pessoa recebendo" value={field.value} onChange={field.onChange} options={personOptions} error={errors.host_person?.message} />} />
      </View>
      <Controller control={form.control} name="direction" render={({ field }) => <Input label="Sentido da viagem" value={field.value} onChangeText={field.onChange} error={errors.direction?.message} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="origin_city" render={({ field }) => <Input label="Cidade de origem" value={field.value} onChangeText={field.onChange} error={errors.origin_city?.message} />} />
        <Controller control={form.control} name="destination_city" render={({ field }) => <Input label="Cidade de destino" value={field.value} onChangeText={field.onChange} error={errors.destination_city?.message} />} />
      </View>
      <View style={styles.grid}>
        <Controller control={form.control} name="start_date" render={({ field }) => <DateInput label="Data de ida" value={field.value} onChangeText={field.onChange} error={errors.start_date?.message} />} />
        <Controller control={form.control} name="end_date" render={({ field }) => <DateInput label="Data de volta" value={field.value} onChangeText={field.onChange} error={errors.end_date?.message} />} />
      </View>
      <View style={styles.grid}>
        <Controller control={form.control} name="status" render={({ field }) => <Select label="Status" value={field.value} onChange={field.onChange} options={statusOptions} error={errors.status?.message} />} />
        <Controller control={form.control} name="priority" render={({ field }) => <Select label="Prioridade" value={field.value} onChange={field.onChange} options={priorityOptions} error={errors.priority?.message} />} />
      </View>
      <Controller control={form.control} name="planned_budget" render={({ field }) => <MoneyInput label="Orçamento planejado" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.planned_budget?.message} />} />
      <Controller control={form.control} name="purpose" render={({ field }) => <Input label="Objetivo" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Controller control={form.control} name="tickets_url" render={({ field }) => <Input label="Link de passagens" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <Controller control={form.control} name="accommodation_url" render={({ field }) => <Input label="Link de hospedagem" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <Controller control={form.control} name="itinerary_url" render={({ field }) => <Input label="Link de roteiro" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="ticket_deadline" render={({ field }) => <DateInput label="Data limite passagem" value={field.value ?? ""} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="accommodation_deadline" render={({ field }) => <DateInput label="Data limite hospedagem" value={field.value ?? ""} onChangeText={field.onChange} />} />
      </View>
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar viagem" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.md },
  grid: { gap: theme.spacing.md }
});

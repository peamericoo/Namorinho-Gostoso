import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { savingsGoalSchema } from "../../lib/validators";
import type { SavingsGoal, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personWithBothOptions, tripOptions } from "./formOptions";

type InputValues = z.input<typeof savingsGoalSchema>;
type Values = z.output<typeof savingsGoalSchema>;

export function SavingsGoalForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<SavingsGoal>; onSubmit: (values: Values) => void; loading?: boolean }) {
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      month: initialValues?.month ?? new Date().toISOString().slice(0, 8) + "01",
      person: initialValues?.person ?? "ambos",
      trip_id: initialValues?.trip_id ?? "",
      target_amount: initialValues?.target_amount ?? 0,
      saved_amount: initialValues?.saved_amount ?? 0,
      notes: initialValues?.notes ?? ""
    } as InputValues
  });
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="month" render={({ field }) => <DateInput label="Mês" value={field.value} onChangeText={field.onChange} error={form.formState.errors.month?.message} />} />
      <Controller control={form.control} name="person" render={({ field }) => <Select label="Pessoa" value={field.value} onChange={field.onChange} options={personWithBothOptions} />} />
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem relacionada" value={field.value ?? ""} onChange={field.onChange} options={tripOptions(trips)} />} />
      <Controller control={form.control} name="target_amount" render={({ field }) => <MoneyInput label="Meta" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="saved_amount" render={({ field }) => <MoneyInput label="Valor economizado" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar meta" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

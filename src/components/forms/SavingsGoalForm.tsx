import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { buildFormErrorSummary, submitErrorMessage } from "../../lib/formFeedback";
import { savingsGoalSchema } from "../../lib/validators";
import type { SavingsGoal, Trip } from "../../types/models";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personWithBothOptions, tripOptions } from "./formOptions";

type InputValues = z.input<typeof savingsGoalSchema>;
type Values = z.output<typeof savingsGoalSchema>;

const fieldLabels: Record<string, string> = {
  month: "mês",
  person: "pessoa",
  target_amount: "meta",
  saved_amount: "valor economizado"
};

export function SavingsGoalForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<SavingsGoal>; onSubmit: (values: Values) => void | Promise<void>; loading?: boolean }) {
  const [submitError, setSubmitError] = useState("");
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
  const errors = form.formState.errors;

  async function submit(values: Values) {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(submitErrorMessage(err, "Não foi possível salvar a meta."));
    }
  }

  function submitInvalid(formErrors: FieldErrors<InputValues>) {
    setSubmitError(buildFormErrorSummary(formErrors, fieldLabels));
  }

  return (
    <View style={styles.form}>
      <Controller control={form.control} name="month" render={({ field }) => <DateInput label="Mês" value={field.value} onChangeText={field.onChange} error={errors.month?.message} required />} />
      <Controller control={form.control} name="person" render={({ field }) => <Select label="Pessoa" value={field.value} onChange={field.onChange} options={personWithBothOptions} error={errors.person?.message} required />} />
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem relacionada" value={field.value ?? ""} onChange={field.onChange} options={tripOptions(trips)} />} />
      <Controller control={form.control} name="target_amount" render={({ field }) => <MoneyInput label="Meta" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.target_amount?.message} required />} />
      <Controller control={form.control} name="saved_amount" render={({ field }) => <MoneyInput label="Valor economizado" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.saved_amount?.message} required />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      {submitError ? <AlertBanner tone="danger" message={submitError} /> : null}
      <Button title="Salvar meta" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submit, submitInvalid)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

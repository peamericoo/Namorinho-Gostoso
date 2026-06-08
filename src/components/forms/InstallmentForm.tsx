import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { installmentSchema } from "../../lib/validators";
import type { Installment, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { paymentOptions, personOptions, tripOptions } from "./formOptions";

type InputValues = z.input<typeof installmentSchema>;
type Values = z.output<typeof installmentSchema>;

export function InstallmentForm({ trips, initialValues, onSubmit, loading }: { trips: Trip[]; initialValues?: Partial<Installment>; onSubmit: (values: Values) => void; loading?: boolean }) {
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? "",
      responsible_person: initialValues?.responsible_person ?? "pedro",
      description: initialValues?.description ?? "",
      total_amount: initialValues?.total_amount ?? 0,
      installment_count: initialValues?.installment_count ?? 1,
      installment_amount: initialValues?.installment_amount ?? 0,
      current_installment: initialValues?.current_installment ?? 1,
      due_date: initialValues?.due_date ?? new Date().toISOString().slice(0, 10),
      status: initialValues?.status ?? "pendente",
      payment_method: initialValues?.payment_method ?? "Cartão de crédito",
      notes: initialValues?.notes ?? ""
    } as InputValues
  });
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value ?? ""} onChange={field.onChange} options={tripOptions(trips)} />} />
      <Controller control={form.control} name="responsible_person" render={({ field }) => <Select label="Pessoa responsável" value={field.value} onChange={field.onChange} options={personOptions} />} />
      <Controller control={form.control} name="description" render={({ field }) => <Input label="Gasto relacionado" value={field.value} onChangeText={field.onChange} error={form.formState.errors.description?.message} />} />
      <Controller control={form.control} name="total_amount" render={({ field }) => <MoneyInput label="Valor total" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="installment_count" render={({ field }) => <Input label="Número de parcelas" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="number-pad" />} />
        <Controller control={form.control} name="current_installment" render={({ field }) => <Input label="Parcela atual" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="number-pad" />} />
      </View>
      <Controller control={form.control} name="installment_amount" render={({ field }) => <MoneyInput label="Valor da parcela" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="due_date" render={({ field }) => <DateInput label="Data de vencimento" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="payment_method" render={({ field }) => <Select label="Forma de pagamento" value={field.value ?? ""} onChange={field.onChange} options={paymentOptions} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar parcelamento" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md }, grid: { gap: theme.spacing.md } });

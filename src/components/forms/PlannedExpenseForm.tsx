import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { plannedExpenseSchema } from "../../lib/validators";
import type { Category, PlannedExpense, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { categoryOptions, costTypeOptions, paymentOptions, personOptions, personWithBothOptions, tripOptions, yesNoOptions } from "./formOptions";

type InputValues = z.input<typeof plannedExpenseSchema>;
type Values = z.output<typeof plannedExpenseSchema>;

export function PlannedExpenseForm({ trips, categories, initialValues, onSubmit, loading }: { trips: Trip[]; categories: Category[]; initialValues?: Partial<PlannedExpense>; onSubmit: (values: Values) => void; loading?: boolean }) {
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(plannedExpenseSchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? trips[0]?.id ?? "",
      owner_person: initialValues?.owner_person ?? "pedro",
      expected_date: initialValues?.expected_date ?? new Date().toISOString().slice(0, 10),
      category_id: initialValues?.category_id ?? categories[0]?.id ?? "",
      subcategory_id: initialValues?.subcategory_id ?? "",
      cost_type: initialValues?.cost_type ?? "variavel",
      description: initialValues?.description ?? "",
      planned_amount: initialValues?.planned_amount ?? 0,
      min_amount: initialValues?.min_amount ?? 0,
      max_amount: initialValues?.max_amount ?? 0,
      probability: initialValues?.probability ?? 100,
      is_required: initialValues?.is_required ?? true,
      paid_by_person: initialValues?.paid_by_person ?? "ambos",
      beneficiary_person: initialValues?.beneficiary_person ?? "ambos",
      payment_method: initialValues?.payment_method ?? "Pix",
      is_installment: initialValues?.is_installment ?? false,
      installment_count: initialValues?.installment_count ?? 1,
      status: initialValues?.status ?? "orcado",
      notes: initialValues?.notes ?? ""
    } as InputValues
  });
  const errors = form.formState.errors;
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} />} />
      <Controller control={form.control} name="owner_person" render={({ field }) => <Select label="Pessoa" value={field.value} onChange={field.onChange} options={personOptions} error={errors.owner_person?.message} />} />
      <Controller control={form.control} name="expected_date" render={({ field }) => <DateInput label="Data prevista" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="category_id" render={({ field }) => <Select label="Categoria" value={field.value} onChange={field.onChange} options={categoryOptions(categories)} error={errors.category_id?.message} />} />
      <Controller control={form.control} name="cost_type" render={({ field }) => <Select label="Tipo de custo" value={field.value} onChange={field.onChange} options={costTypeOptions} />} />
      <Controller control={form.control} name="description" render={({ field }) => <Input label="Descrição" value={field.value} onChangeText={field.onChange} error={errors.description?.message} />} />
      <Controller control={form.control} name="planned_amount" render={({ field }) => <MoneyInput label="Valor planejado" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.planned_amount?.message} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="min_amount" render={({ field }) => <MoneyInput label="Valor mínimo" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="max_amount" render={({ field }) => <MoneyInput label="Valor máximo" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      </View>
      <Controller control={form.control} name="probability" render={({ field }) => <Input label="Probabilidade %" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
      <Controller control={form.control} name="is_required" render={({ field }) => <Select label="Obrigatório?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="paid_by_person" render={({ field }) => <Select label="Pago por" value={field.value} onChange={field.onChange} options={personWithBothOptions} />} />
        <Controller control={form.control} name="beneficiary_person" render={({ field }) => <Select label="Beneficiário" value={field.value} onChange={field.onChange} options={personWithBothOptions} />} />
      </View>
      <Controller control={form.control} name="payment_method" render={({ field }) => <Select label="Forma de pagamento" value={field.value ?? ""} onChange={field.onChange} options={paymentOptions} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="is_installment" render={({ field }) => <Select label="Parcelado?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
        <Controller control={form.control} name="installment_count" render={({ field }) => <Input label="Número de parcelas" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="number-pad" />} />
      </View>
      <Controller control={form.control} name="status" render={({ field }) => <Input label="Status" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar custo planejado" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md }, grid: { gap: theme.spacing.md } });

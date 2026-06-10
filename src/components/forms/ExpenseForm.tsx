import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { expenseSchema } from "../../lib/validators";
import { updateExpense, uploadReceipt } from "../../services/finance.service";
import type { Category, Expense, Trip } from "../../types/models";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { categoryOptions, costTypeOptions, paymentOptions, personOptions, personWithBothOptions, tripOptions, yesNoOptions } from "./formOptions";

type ExpenseFormInput = z.input<typeof expenseSchema>;
type ExpenseFormValues = z.output<typeof expenseSchema>;

export function ExpenseForm({
  coupleId,
  trips,
  categories,
  initialValues,
  onSubmit,
  afterSubmit,
  loading
}: {
  coupleId: string;
  trips: Trip[];
  categories: Category[];
  initialValues?: Partial<Expense>;
  onSubmit: (values: ExpenseFormValues) => Promise<Expense>;
  afterSubmit?: () => void;
  loading?: boolean;
}) {
  const [pendingReceipt, setPendingReceipt] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      trip_id: initialValues?.trip_id ?? trips[0]?.id ?? "",
      spent_at: initialValues?.spent_at ?? new Date().toISOString().slice(0, 10),
      paid_by_person: initialValues?.paid_by_person ?? "pedro",
      beneficiary_person: initialValues?.beneficiary_person ?? "ambos",
      category_id: initialValues?.category_id ?? categories[0]?.id ?? "",
      subcategory_id: initialValues?.subcategory_id ?? "",
      cost_type: initialValues?.cost_type ?? "variavel",
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      payment_method: initialValues?.payment_method ?? "Pix",
      account_label: initialValues?.account_label ?? "",
      is_installment: initialValues?.is_installment ?? false,
      installment_count: initialValues?.installment_count ?? 1,
      current_installment: initialValues?.current_installment ?? 1,
      installment_amount: initialValues?.installment_amount ?? 0,
      is_reimbursable: initialValues?.is_reimbursable ?? true,
      should_split: initialValues?.should_split ?? true,
      split_pedro_percent: initialValues?.split_pedro_percent ?? 50,
      split_camilly_percent: initialValues?.split_camilly_percent ?? 50,
      receipt_url: initialValues?.receipt_url ?? "",
      notes: initialValues?.notes ?? ""
    } as ExpenseFormInput
  });
  const errors = form.formState.errors;

  async function attachReceipt() {
    const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"], copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!initialValues?.id) {
      setPendingReceipt(asset);
      form.setValue("receipt_url", asset.name);
      return;
    }
    const path = await uploadReceipt(coupleId, initialValues.id, { uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
    form.setValue("receipt_url", path, { shouldDirty: true });
  }

  async function submit(values: ExpenseFormValues) {
    const saved = await onSubmit(pendingReceipt ? { ...values, receipt_url: null } : values);
    if (pendingReceipt) {
      const path = await uploadReceipt(coupleId, saved.id, {
        uri: pendingReceipt.uri,
        name: pendingReceipt.name,
        mimeType: pendingReceipt.mimeType
      });
      await updateExpense(saved.id, { receipt_url: path });
      form.setValue("receipt_url", path);
      setPendingReceipt(null);
    }
    afterSubmit?.();
  }

  return (
    <View style={styles.form}>
      <Controller control={form.control} name="trip_id" render={({ field }) => <Select label="Viagem" value={field.value} onChange={field.onChange} options={tripOptions(trips)} error={errors.trip_id?.message} />} />
      <Controller control={form.control} name="spent_at" render={({ field }) => <DateInput label="Data" value={field.value} onChangeText={field.onChange} error={errors.spent_at?.message} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="paid_by_person" render={({ field }) => <Select label="Pessoa que pagou" value={field.value} onChange={field.onChange} options={personOptions} error={errors.paid_by_person?.message} />} />
        <Controller control={form.control} name="beneficiary_person" render={({ field }) => <Select label="Beneficiário" value={field.value} onChange={field.onChange} options={personWithBothOptions} error={errors.beneficiary_person?.message} />} />
      </View>
      <Controller control={form.control} name="category_id" render={({ field }) => <Select label="Categoria" value={field.value} onChange={field.onChange} options={categoryOptions(categories)} error={errors.category_id?.message} />} />
      <Controller control={form.control} name="cost_type" render={({ field }) => <Select label="Tipo de custo" value={field.value} onChange={field.onChange} options={costTypeOptions} error={errors.cost_type?.message} />} />
      <Controller control={form.control} name="description" render={({ field }) => <Input label="Descrição" value={field.value} onChangeText={field.onChange} error={errors.description?.message} />} />
      <Controller control={form.control} name="amount" render={({ field }) => <MoneyInput label="Valor" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.amount?.message} />} />
      <Controller control={form.control} name="payment_method" render={({ field }) => <Select label="Forma de pagamento" value={field.value ?? ""} onChange={field.onChange} options={paymentOptions} />} />
      <Controller control={form.control} name="account_label" render={({ field }) => <Input label="Cartão/conta usada" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="is_installment" render={({ field }) => <Select label="Parcelado?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
        <Controller control={form.control} name="installment_count" render={({ field }) => <Input label="Número de parcelas" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="number-pad" error={errors.installment_count?.message} />} />
      </View>
      <View style={styles.grid}>
        <Controller control={form.control} name="current_installment" render={({ field }) => <Input label="Parcela atual" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="number-pad" />} />
        <Controller control={form.control} name="installment_amount" render={({ field }) => <MoneyInput label="Valor da parcela" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
      </View>
      <View style={styles.grid}>
        <Controller control={form.control} name="is_reimbursable" render={({ field }) => <Select label="Reembolsável?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
        <Controller control={form.control} name="should_split" render={({ field }) => <Select label="Deve dividir?" value={String(field.value)} onChange={(v) => field.onChange(v === "true")} options={yesNoOptions} />} />
      </View>
      <View style={styles.grid}>
        <Controller control={form.control} name="split_pedro_percent" render={({ field }) => <Input label="% Pedro" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" error={errors.split_pedro_percent?.message} />} />
        <Controller control={form.control} name="split_camilly_percent" render={({ field }) => <Input label="% Camilly" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
      </View>
      <Controller control={form.control} name="receipt_url" render={({ field }) => <Input label="Comprovante" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <Button title="Enviar comprovante" variant="secondary" onPress={attachReceipt} />
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      <Button title="Salvar gasto" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.md },
  grid: { gap: theme.spacing.md }
});

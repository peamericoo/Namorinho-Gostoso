import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { buildFormErrorSummary, submitErrorMessage } from "../../lib/formFeedback";
import { categorySchema } from "../../lib/validators";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type Values = z.infer<typeof categorySchema>;

const fieldLabels: Record<string, string> = {
  name: "nome da categoria",
  icon: "ícone",
  color: "cor"
};

export function CategoryForm({ onSubmit, loading }: { onSubmit: (values: Values) => void | Promise<void>; loading?: boolean }) {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "tag", color: "#6C63B7", subcategory: "" }
  });

  async function submit(values: Values) {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(submitErrorMessage(err, "Não foi possível salvar a categoria."));
    }
  }

  function submitInvalid(errors: FieldErrors<Values>) {
    setSubmitError(buildFormErrorSummary(errors, fieldLabels));
  }

  return (
    <View style={styles.form}>
      <Controller control={form.control} name="name" render={({ field }) => <Input label="Nome da categoria" value={field.value} onChangeText={field.onChange} error={form.formState.errors.name?.message} required />} />
      <Controller control={form.control} name="icon" render={({ field }) => <Input label="Ícone" value={field.value} onChangeText={field.onChange} error={form.formState.errors.icon?.message} required />} />
      <Controller control={form.control} name="color" render={({ field }) => <Input label="Cor" value={field.value} onChangeText={field.onChange} error={form.formState.errors.color?.message} required />} />
      <Controller control={form.control} name="subcategory" render={({ field }) => <Input label="Primeira subcategoria" value={field.value ?? ""} onChangeText={field.onChange} />} />
      {submitError ? <AlertBanner tone="danger" message={submitError} /> : null}
      <Button title="Salvar categoria" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submit, submitInvalid)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

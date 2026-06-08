import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { categorySchema } from "../../lib/validators";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type Values = z.infer<typeof categorySchema>;

export function CategoryForm({ onSubmit, loading }: { onSubmit: (values: Values) => void; loading?: boolean }) {
  const form = useForm<Values>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "tag", color: "#6C63B7", subcategory: "" }
  });
  return (
    <View style={styles.form}>
      <Controller control={form.control} name="name" render={({ field }) => <Input label="Nome da categoria" value={field.value} onChangeText={field.onChange} error={form.formState.errors.name?.message} />} />
      <Controller control={form.control} name="icon" render={({ field }) => <Input label="Ícone" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="color" render={({ field }) => <Input label="Cor" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={form.control} name="subcategory" render={({ field }) => <Input label="Primeira subcategoria" value={field.value ?? ""} onChangeText={field.onChange} />} />
      <Button title="Salvar categoria" loading={loading} onPress={form.handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: theme.spacing.md } });

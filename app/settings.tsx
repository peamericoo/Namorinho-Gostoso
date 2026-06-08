import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { z } from "zod";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { Input } from "../src/components/ui/Input";
import { MoneyInput } from "../src/components/ui/MoneyInput";
import { Screen } from "../src/components/ui/Screen";
import { Select } from "../src/components/ui/Select";
import { theme } from "../src/constants/theme";
import { useAuth } from "../src/hooks/useAuth";
import { useSettingsMutations } from "../src/hooks/useFinanceData";
import { useWorkspace } from "../src/hooks/useWorkspace";

const schema = z
  .object({
    display_name: z.string().min(2, "Informe o nome curto."),
    full_name: z.string().min(2, "Informe o nome completo."),
    person_key: z.enum(["pedro", "camilly"]),
    name: z.string().min(2, "Informe o nome do casal."),
    default_split_pedro: z.coerce.number().min(0).max(100),
    default_split_camilly: z.coerce.number().min(0).max(100),
    monthly_budget_pedro: z.coerce.number().min(0),
    monthly_budget_camilly: z.coerce.number().min(0),
    monthly_budget_shared: z.coerce.number().min(0),
    emergency_reserve_percent: z.coerce.number().min(0).max(100)
  })
  .refine((data) => data.default_split_pedro + data.default_split_camilly === 100, {
    path: ["default_split_pedro"],
    message: "A divisão padrão precisa somar 100%."
  });

type InputValues = z.input<typeof schema>;
type Values = z.output<typeof schema>;

export default function SettingsScreen() {
  const workspace = useWorkspace();
  const mutations = useSettingsMutations();
  const auth = useAuth();
  const profile = workspace.data?.profile;
  const couple = workspace.data?.couple;
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(schema),
    values: {
      display_name: profile?.display_name ?? "",
      full_name: profile?.full_name ?? "",
      person_key: profile?.person_key ?? "pedro",
      name: couple?.name ?? "Pedro e Camilly",
      default_split_pedro: couple?.default_split_pedro ?? 50,
      default_split_camilly: couple?.default_split_camilly ?? 50,
      monthly_budget_pedro: couple?.monthly_budget_pedro ?? 0,
      monthly_budget_camilly: couple?.monthly_budget_camilly ?? 0,
      monthly_budget_shared: couple?.monthly_budget_shared ?? 0,
      emergency_reserve_percent: couple?.emergency_reserve_percent ?? 12
    } as InputValues
  });

  async function submit(values: Values) {
    await mutations.updateProfile.mutateAsync({
      display_name: values.display_name,
      full_name: values.full_name,
      person_key: values.person_key
    });
    await mutations.updateCouple.mutateAsync({
      name: values.name,
      default_split_pedro: values.default_split_pedro,
      default_split_camilly: values.default_split_camilly,
      monthly_budget_pedro: values.monthly_budget_pedro,
      monthly_budget_camilly: values.monthly_budget_camilly,
      monthly_budget_shared: values.monthly_budget_shared,
      emergency_reserve_percent: values.emergency_reserve_percent
    });
  }

  return (
    <Screen>
      <Header title="Configurações" subtitle="Perfil, orçamentos e regras padrão do casal." />
      <Card>
        <Text style={styles.title}>Perfil</Text>
        <Controller control={form.control} name="full_name" render={({ field }) => <Input label="Nome completo" value={field.value} onChangeText={field.onChange} error={form.formState.errors.full_name?.message} />} />
        <Controller control={form.control} name="display_name" render={({ field }) => <Input label="Nome curto" value={field.value} onChangeText={field.onChange} error={form.formState.errors.display_name?.message} />} />
        <Controller control={form.control} name="person_key" render={({ field }) => <Select label="Pessoa" value={field.value} onChange={field.onChange} options={[{ label: "Pedro", value: "pedro" }, { label: "Camilly", value: "camilly" }]} />} />
      </Card>
      <Card>
        <Text style={styles.title}>Casal</Text>
        <Controller control={form.control} name="name" render={({ field }) => <Input label="Nome do espaço" value={field.value} onChangeText={field.onChange} error={form.formState.errors.name?.message} />} />
        <Controller control={form.control} name="default_split_pedro" render={({ field }) => <Input label="Divisão Pedro %" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" error={form.formState.errors.default_split_pedro?.message} />} />
        <Controller control={form.control} name="default_split_camilly" render={({ field }) => <Input label="Divisão Camilly %" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
        <Controller control={form.control} name="monthly_budget_pedro" render={({ field }) => <MoneyInput label="Orçamento mensal Pedro" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="monthly_budget_camilly" render={({ field }) => <MoneyInput label="Orçamento mensal Camilly" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="monthly_budget_shared" render={({ field }) => <MoneyInput label="Orçamento conjunto" value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="emergency_reserve_percent" render={({ field }) => <Input label="Reserva de emergência %" value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
        <Button title="Salvar configurações" loading={mutations.updateCouple.isPending || mutations.updateProfile.isPending} onPress={form.handleSubmit(submit)} />
      </Card>
      <Button title="Sair da conta" variant="danger" onPress={auth.signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 }
});

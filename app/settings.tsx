import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { useState } from "react";
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

const emailSchema = z.object({
  email: z.string().email("Informe um e-mail válido.")
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Use pelo menos 6 caracteres."),
    confirm: z.string().min(6, "Confirme sua senha.")
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As senhas precisam ser iguais." });

export default function SettingsScreen() {
  const workspace = useWorkspace();
  const mutations = useSettingsMutations();
  const auth = useAuth();
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");
  const profile = workspace.data?.profile;
  const couple = workspace.data?.couple;
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(schema),
    values: {
      display_name: profile?.display_name ?? "",
      full_name: profile?.full_name ?? "",
      person_key: profile?.person_key ?? "pedro",
      name: couple?.name ?? "",
      default_split_pedro: couple?.default_split_pedro ?? 50,
      default_split_camilly: couple?.default_split_camilly ?? 50,
      monthly_budget_pedro: couple?.monthly_budget_pedro ?? 0,
      monthly_budget_camilly: couple?.monthly_budget_camilly ?? 0,
      monthly_budget_shared: couple?.monthly_budget_shared ?? 0,
      emergency_reserve_percent: couple?.emergency_reserve_percent ?? 12
    } as InputValues
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    values: { email: auth.user?.email ?? "" }
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" }
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

  async function submitEmail(values: z.infer<typeof emailSchema>) {
    setAccountMessage("");
    setAccountError("");
    try {
      await auth.updateEmail(values.email.trim());
      setAccountMessage("Enviamos a confirmação para concluir a troca de e-mail.");
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Não foi possível trocar o e-mail.");
    }
  }

  async function submitPassword(values: z.infer<typeof passwordSchema>) {
    setAccountMessage("");
    setAccountError("");
    try {
      await auth.updatePassword(values.password);
      passwordForm.reset({ password: "", confirm: "" });
      setAccountMessage("Senha atualizada com sucesso.");
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Não foi possível trocar a senha.");
    }
  }

  return (
    <Screen>
      <Header title="Configurações" subtitle="Perfil, orçamentos e regras padrão do casal." back onBack={() => router.replace("/(tabs)/more")} />
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
      <Card>
        <Text style={styles.title}>Acesso</Text>
        <Input label="Código de convite" value={couple?.invite_code ?? ""} editable={false} helperText="Compartilhe este código apenas com a outra pessoa do casal para entrar no mesmo espaço." />
        <Controller
          control={emailForm.control}
          name="email"
          render={({ field }) => <Input label="E-mail da conta" value={field.value} onChangeText={field.onChange} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" error={emailForm.formState.errors.email?.message} />}
        />
        <Button title="Trocar e-mail" variant="secondary" loading={emailForm.formState.isSubmitting} onPress={emailForm.handleSubmit(submitEmail)} />
        <Controller
          control={passwordForm.control}
          name="password"
          render={({ field }) => <Input label="Nova senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={passwordForm.formState.errors.password?.message} />}
        />
        <Controller
          control={passwordForm.control}
          name="confirm"
          render={({ field }) => <Input label="Confirmar nova senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={passwordForm.formState.errors.confirm?.message} />}
        />
        {accountMessage ? <Text style={styles.success}>{accountMessage}</Text> : null}
        {accountError ? <Text style={styles.error}>{accountError}</Text> : null}
        <Button title="Trocar senha" variant="secondary" loading={passwordForm.formState.isSubmitting} onPress={passwordForm.handleSubmit(submitPassword)} />
      </Card>
      <Button
        title="Sair da conta"
        variant="danger"
        onPress={() => {
          void auth.signOut().then(() => router.replace("/auth/login"));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  success: { color: theme.colors.successStrong, fontWeight: "800" },
  error: { color: theme.colors.dangerStrong, fontWeight: "800" }
});

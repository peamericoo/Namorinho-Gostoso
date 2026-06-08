import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";
import { z } from "zod";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { Select } from "../../src/components/ui/Select";
import { personOptions } from "../../src/components/forms/formOptions";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { queryClient } from "../../src/lib/queryClient";
import { setupProfileAndCouple } from "../../src/services/finance.service";

const schema = z.object({
  fullName: z.string().min(2, "Informe seu nome."),
  displayName: z.string().min(2, "Informe como quer aparecer."),
  personKey: z.enum(["pedro", "camilly"]),
  coupleName: z.string().min(2, "Informe o nome do espaço.")
});

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", displayName: "", personKey: "pedro", coupleName: "Pedro e Camilly" }
  });

  async function submit(values: z.infer<typeof schema>) {
    if (!user) return;
    await setupProfileAndCouple({ userId: user.id, ...values });
    await queryClient.invalidateQueries();
    router.replace("/");
  }

  return (
    <Screen>
      <Header title="Configurar perfil" subtitle="Crie seu perfil e o espaço financeiro compartilhado." />
      <Card>
        <Controller control={form.control} name="fullName" render={({ field }) => <Input label="Nome completo" value={field.value} onChangeText={field.onChange} error={form.formState.errors.fullName?.message} />} />
        <Controller control={form.control} name="displayName" render={({ field }) => <Input label="Nome curto" value={field.value} onChangeText={field.onChange} error={form.formState.errors.displayName?.message} />} />
        <Controller control={form.control} name="personKey" render={({ field }) => <Select label="Quem é você?" value={field.value} onChange={field.onChange} options={personOptions} />} />
        <Controller control={form.control} name="coupleName" render={({ field }) => <Input label="Nome do espaço" value={field.value} onChangeText={field.onChange} error={form.formState.errors.coupleName?.message} />} />
        {form.formState.errors.root?.message ? <Text style={{ color: theme.colors.dangerStrong }}>{form.formState.errors.root.message}</Text> : null}
        <Button title="Salvar e entrar" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
      </Card>
    </Screen>
  );
}

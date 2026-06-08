import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { Header } from "../../src/components/ui/Header";
import { theme } from "../../src/constants/theme";

const schema = z
  .object({
    email: z.string().email("Informe um e-mail válido."),
    password: z.string().min(6, "Use pelo menos 6 caracteres."),
    confirm: z.string().min(6, "Confirme sua senha.")
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As senhas precisam ser iguais." });

export default function SignupScreen() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", confirm: "" } });

  async function submit(values: z.infer<typeof schema>) {
    setError("");
    try {
      await auth.signUp(values.email, values.password);
      router.replace("/auth/profile-setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    }
  }

  return (
    <Screen>
      <Header title="Criar conta" subtitle="Depois você cria o espaço compartilhado do casal." back onBack={() => router.replace("/auth/login")} />
      <Card>
        <Controller control={form.control} name="email" render={({ field }) => <Input label="E-mail" value={field.value} onChangeText={field.onChange} autoCapitalize="none" error={form.formState.errors.email?.message} />} />
        <Controller control={form.control} name="password" render={({ field }) => <Input label="Senha" value={field.value} onChangeText={field.onChange} secureTextEntry error={form.formState.errors.password?.message} />} />
        <Controller control={form.control} name="confirm" render={({ field }) => <Input label="Confirmar senha" value={field.value} onChangeText={field.onChange} secureTextEntry error={form.formState.errors.confirm?.message} />} />
        {error ? <Text style={{ color: theme.colors.dangerStrong, fontWeight: "800" }}>{error}</Text> : null}
        <Button title="Criar conta" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
        <Button title="Voltar para login" variant="ghost" onPress={() => router.replace("/auth/login")} />
      </Card>
    </Screen>
  );
}

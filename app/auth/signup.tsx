import { router } from "expo-router";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AuthLayout, AuthMessage, AuthTextLink } from "../../src/components/auth/AuthLayout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";

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
  const [message, setMessage] = useState("");
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", confirm: "" } });

  async function submit(values: z.infer<typeof schema>) {
    setError("");
    setMessage("");
    try {
      const result = await auth.signUp(values.email.trim(), values.password);
      if (!result.session) {
        setMessage("Cadastro iniciado. Confirme seu e-mail e depois entre para criar o espaço.");
        return;
      }
      router.replace("/auth/profile-setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    }
  }

  return (
    <AuthLayout
      eyebrow="novo começo"
      title="Crie uma base para os planos."
      subtitle="O cadastro abre o caminho para organizar visitas, economias e decisões sem transformar afeto em ruído."
      variant="signup"
      backLabel="Já tenho conta"
      onBack={() => router.replace("/auth/login")}
      footer={<AuthTextLink onPress={() => router.replace("/auth/login")}>Voltar para login</AuthTextLink>}
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field }) => (
          <Input label="E-mail" value={field.value} onChangeText={field.onChange} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" error={form.formState.errors.email?.message} required />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field }) => (
          <Input label="Senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={form.formState.errors.password?.message} required />
        )}
      />
      <Controller
        control={form.control}
        name="confirm"
        render={({ field }) => (
          <Input label="Confirmar senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={form.formState.errors.confirm?.message} required />
        )}
      />
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage>{error}</AuthMessage> : null}
      <Button title="Criar conta" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
    </AuthLayout>
  );
}

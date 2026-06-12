import { router } from "expo-router";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AuthLayout, AuthMessage, AuthTextLink } from "../../src/components/auth/AuthLayout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({ email: z.string().email("Informe um e-mail válido.") });

export default function ForgotPasswordScreen() {
  const auth = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function submit(values: z.infer<typeof schema>) {
    setMessage("");
    setError("");
    try {
      await auth.resetPassword(values.email.trim());
      setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar as instruções.");
    }
  }

  return (
    <AuthLayout
      eyebrow="recuperar acesso"
      title="Volte sem perder o ritmo."
      subtitle="Informe o e-mail da conta. Se ele existir, enviamos um caminho seguro para você entrar novamente."
      variant="recovery"
      backLabel="Voltar ao login"
      onBack={() => router.replace("/auth/login")}
      footer={<AuthTextLink onPress={() => router.replace("/auth/login")}>Lembrei minha senha</AuthTextLink>}
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field }) => (
          <Input label="E-mail" value={field.value} onChangeText={field.onChange} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" error={form.formState.errors.email?.message} required />
        )}
      />
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage>{error}</AuthMessage> : null}
      <Button title="Enviar instruções" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
    </AuthLayout>
  );
}

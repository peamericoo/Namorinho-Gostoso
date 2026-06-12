import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout, AuthMessage, AuthTextLink } from "../../src/components/auth/AuthLayout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z
  .object({
    password: z.string().min(6, "Use pelo menos 6 caracteres."),
    confirm: z.string().min(6, "Confirme sua senha.")
  })
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As senhas precisam ser iguais." });

export default function ResetPasswordScreen() {
  const auth = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  async function submit(values: z.infer<typeof schema>) {
    setMessage("");
    setError("");
    if (!auth.user) {
      setError("Abra novamente o link recebido por e-mail para validar a sessão de recuperação.");
      return;
    }

    try {
      await auth.updatePassword(values.password);
      setMessage("Senha atualizada. Você já pode entrar com a nova senha.");
      setTimeout(() => router.replace("/auth/login"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar sua senha.");
    }
  }

  return (
    <AuthLayout
      eyebrow="nova senha"
      title="Defina uma senha segura."
      subtitle="Depois de abrir o link recebido por e-mail, escolha uma nova senha para recuperar o acesso."
      variant="recovery"
      backLabel="Voltar ao login"
      onBack={() => router.replace("/auth/login")}
      footer={<AuthTextLink onPress={() => router.replace("/auth/forgot-password")}>Enviar outro e-mail</AuthTextLink>}
    >
      <Controller
        control={form.control}
        name="password"
        render={({ field }) => (
          <Input label="Nova senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={form.formState.errors.password?.message} required />
        )}
      />
      <Controller
        control={form.control}
        name="confirm"
        render={({ field }) => (
          <Input label="Confirmar nova senha" value={field.value} onChangeText={field.onChange} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={form.formState.errors.confirm?.message} required />
        )}
      />
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage>{error}</AuthMessage> : null}
      <Button title="Atualizar senha" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
    </AuthLayout>
  );
}

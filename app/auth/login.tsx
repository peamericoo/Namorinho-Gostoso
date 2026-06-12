import { router } from "expo-router";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AuthLayout, AuthMessage, AuthTextLink } from "../../src/components/auth/AuthLayout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Informe sua senha.")
});

export default function LoginScreen() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  async function submit(values: z.infer<typeof schema>) {
    setError("");
    try {
      await auth.signIn(values.email.trim(), values.password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  }

  return (
    <AuthLayout
      eyebrow="bem-vindos de volta"
      title="Entre no espaço de vocês."
      subtitle="Acesse viagens, combinados financeiros, memórias em construção e próximos passos com a calma que uma relação merece."
      variant="signin"
      footer={
        <>
          <AuthTextLink onPress={() => router.push("/auth/signup")}>Criar um novo espaço</AuthTextLink>
          <AuthTextLink onPress={() => router.push("/auth/forgot-password")}>Recuperar acesso</AuthTextLink>
        </>
      }
    >
      <Controller
        control={form.control}
        name="email"
        render={({ field }) => (
          <Input
            label="E-mail"
            value={field.value}
            onChangeText={field.onChange}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            error={form.formState.errors.email?.message}
            required
          />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field }) => (
          <Input
            label="Senha"
            value={field.value}
            onChangeText={field.onChange}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            error={form.formState.errors.password?.message}
            required
          />
        )}
      />
      {error ? <AuthMessage>{error}</AuthMessage> : null}
      <Button title="Entrar" onPress={form.handleSubmit(submit)} loading={form.formState.isSubmitting} />
    </AuthLayout>
  );
}

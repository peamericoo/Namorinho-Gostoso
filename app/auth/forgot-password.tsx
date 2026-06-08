import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { theme } from "../../src/constants/theme";

const schema = z.object({ email: z.string().email("Informe um e-mail válido.") });

export default function ForgotPasswordScreen() {
  const auth = useAuth();
  const [message, setMessage] = useState("");
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  async function submit(values: z.infer<typeof schema>) {
    await auth.resetPassword(values.email);
    setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
  }
  return (
    <Screen>
      <Header title="Recuperar senha" subtitle="Informe o e-mail usado no app." />
      <Card>
        <Controller control={form.control} name="email" render={({ field }) => <Input label="E-mail" value={field.value} onChangeText={field.onChange} autoCapitalize="none" error={form.formState.errors.email?.message} />} />
        {message ? <Text style={{ color: theme.colors.successStrong, fontWeight: "800" }}>{message}</Text> : null}
        <Button title="Enviar instruções" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
        <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}

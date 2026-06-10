import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Informe sua senha.")
});

export default function LoginScreen() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "paletot.business@gmail.com", password: "" }
  });

  async function submit(values: z.infer<typeof schema>) {
    setError("");
    try {
      await auth.signIn(values.email, values.password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.logo}>Plano a Dois</Text>
        <Text style={styles.subtitle}>Viagens, gastos e acertos de Pedro e Camilly em um só lugar.</Text>
      </View>
      <Card>
        <Controller control={form.control} name="email" render={({ field }) => <Input label="E-mail" value={field.value} onChangeText={field.onChange} autoCapitalize="none" keyboardType="email-address" error={form.formState.errors.email?.message} />} />
        <Controller control={form.control} name="password" render={({ field }) => <Input label="Senha" value={field.value} onChangeText={field.onChange} secureTextEntry error={form.formState.errors.password?.message} />} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Entrar" onPress={form.handleSubmit(submit)} loading={form.formState.isSubmitting} />
        <View style={styles.links}>
          <Link href="/auth/signup" style={styles.link}>Criar conta</Link>
          <Link href="/auth/forgot-password" style={styles.link}>Esqueci minha senha</Link>
        </View>
        <Text style={styles.demo}>Primeiro acesso: entre com o e-mail principal e a senha combinada.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: theme.spacing.sm, paddingVertical: theme.spacing.xl },
  logo: { color: theme.colors.text, fontSize: 34, fontWeight: "900", textAlign: "center" },
  subtitle: { color: theme.colors.muted, textAlign: "center", fontSize: 16, lineHeight: 23 },
  links: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: theme.spacing.md },
  link: { color: theme.colors.coupleStrong, fontWeight: "900" },
  error: { color: theme.colors.dangerStrong, fontWeight: "800" },
  demo: { color: theme.colors.muted, fontWeight: "700", textAlign: "center" }
});

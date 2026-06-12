import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout, AuthMessage } from "../../src/components/auth/AuthLayout";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { personOptions } from "../../src/components/forms/formOptions";
import { useAuth } from "../../src/hooks/useAuth";
import { queryClient } from "../../src/lib/queryClient";
import { joinExistingWorkspace, setupProfileAndCouple } from "../../src/services/finance.service";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Informe seu nome."),
    displayName: z.string().trim().min(2, "Informe como quer aparecer."),
    personKey: z.enum(["pedro", "camilly"], { error: "Selecione quem é você." }),
    coupleName: z.string().trim(),
    inviteCode: z.string().trim()
  })
  .superRefine((data, context) => {
    if (data.coupleName || data.inviteCode) return;
    context.addIssue({ code: "custom", path: ["coupleName"], message: "Informe o nome de um novo espaço." });
    context.addIssue({ code: "custom", path: ["inviteCode"], message: "Informe o código de convite." });
  });

export default function ProfileSetupScreen() {
  const auth = useAuth();
  const user = auth.user;
  const [mode, setMode] = useState<"create" | "join">("create");
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", displayName: "", personKey: "pedro", coupleName: "", inviteCode: "" }
  });

  async function submit(values: z.infer<typeof schema>) {
    if (!user) return;
    try {
      if (values.inviteCode) {
        await joinExistingWorkspace({ userId: user.id, fullName: values.fullName, displayName: values.displayName, personKey: values.personKey, inviteCode: values.inviteCode });
      } else {
        await setupProfileAndCouple({ userId: user.id, fullName: values.fullName, displayName: values.displayName, personKey: values.personKey, coupleName: values.coupleName });
      }
      await queryClient.invalidateQueries();
      router.replace("/");
    } catch (err: unknown) {
      form.setError("root", { message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <AuthLayout
      eyebrow="primeiro combinado"
      title="Monte o espaço de vocês."
      subtitle="Defina o perfil e o nome do espaço compartilhado. O app cuida da estrutura para vocês começarem com clareza."
      variant="setup"
      backLabel="Sair"
      onBack={() => {
        void auth.signOut();
        router.replace("/auth/login");
      }}
    >
      <Button
        title={mode === "create" ? "Tenho um código de convite" : "Criar um espaço novo"}
        variant="secondary"
        onPress={() => {
          const nextMode = mode === "create" ? "join" : "create";
          setMode(nextMode);
          form.setValue(nextMode === "create" ? "inviteCode" : "coupleName", "");
          form.clearErrors();
        }}
      />
      <Controller control={form.control} name="fullName" render={({ field }) => <Input label="Nome completo" value={field.value} onChangeText={field.onChange} error={form.formState.errors.fullName?.message} required />} />
      <Controller control={form.control} name="displayName" render={({ field }) => <Input label="Nome curto" value={field.value} onChangeText={field.onChange} error={form.formState.errors.displayName?.message} required />} />
      <Controller control={form.control} name="personKey" render={({ field }) => <Select label="Quem é você?" value={field.value} onChange={field.onChange} options={personOptions} required />} />
      {mode === "create" ? (
        <Controller control={form.control} name="coupleName" render={({ field }) => <Input label="Nome do espaço" value={field.value} onChangeText={field.onChange} error={form.formState.errors.coupleName?.message} required />} />
      ) : (
        <Controller control={form.control} name="inviteCode" render={({ field }) => <Input label="Código de convite" value={field.value} onChangeText={(value) => field.onChange(value.toUpperCase())} autoCapitalize="characters" error={form.formState.errors.inviteCode?.message} required />} />
      )}
      {form.formState.errors.root?.message ? <AuthMessage>{form.formState.errors.root.message}</AuthMessage> : null}
      <Button title="Salvar e entrar" loading={form.formState.isSubmitting} onPress={form.handleSubmit(submit)} />
    </AuthLayout>
  );
}

import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { InstallmentForm } from "../src/components/forms/InstallmentForm";
import { InstallmentCard } from "../src/components/finance/InstallmentCard";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";
import { useInstallmentMutations, useInstallments, useTrips } from "../src/hooks/useFinanceData";
import { installmentStatus } from "../src/lib/calculations";
import { money } from "../src/lib/formatters";
import type { Installment } from "../src/types/models";

export default function InstallmentsScreen() {
  const [editing, setEditing] = useState<Installment | null>(null);
  const [open, setOpen] = useState(false);
  const installments = useInstallments();
  const trips = useTrips();
  const mutations = useInstallmentMutations();
  async function save(values: Partial<Installment>) {
    await mutations.save.mutateAsync(editing ? { ...editing, ...values } : values);
    setOpen(false);
    setEditing(null);
  }
  const monthlyImpact = (installments.data ?? []).filter((item) => item.status !== "pago" && item.status !== "concluido").reduce((a, item) => a + installmentStatus(item).monthlyImpact, 0);
  return (
    <Screen>
      <Header title="Parcelamentos" subtitle={`Impacto mensal aberto: ${money(monthlyImpact)}`} back onBack={() => router.replace("/(tabs)/more")} right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      {(installments.data ?? []).map((item) => (
        <Card key={item.id}>
          <InstallmentCard installment={item} />
          <View style={styles.row}>
            <Button title="Marcar pago" variant="secondary" onPress={() => mutations.save.mutate({ ...item, status: "pago" })} />
            <Button title="Editar" variant="secondary" onPress={() => { setEditing(item); setOpen(true); }} />
            <Button title="Excluir" variant="danger" onPress={() => mutations.remove.mutate(item.id)} />
          </View>
        </Card>
      ))}
      <AppModal visible={open} title={editing ? "Editar parcelamento" : "Novo parcelamento"} onClose={() => { setOpen(false); setEditing(null); }}>
        <InstallmentForm trips={trips.data ?? []} initialValues={editing ?? undefined} onSubmit={save} loading={mutations.save.isPending} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md }
});

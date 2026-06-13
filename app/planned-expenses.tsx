import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlannedExpenseForm } from "../src/components/forms/PlannedExpenseForm";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { Screen } from "../src/components/ui/Screen";
import { SectionHeader } from "../src/components/ui/SectionHeader";
import { theme } from "../src/constants/theme";
import { useCategories, usePlannedExpenseMutations, usePlannedExpenses, useTrips } from "../src/hooks/useFinanceData";
import { money, personName } from "../src/lib/formatters";
import type { PlannedExpense } from "../src/types/models";

export default function PlannedExpensesScreen() {
  const [editing, setEditing] = useState<PlannedExpense | null>(null);
  const [open, setOpen] = useState(false);
  const trips = useTrips();
  const categories = useCategories();
  const planned = usePlannedExpenses();
  const mutations = usePlannedExpenseMutations();
  const total = (planned.data ?? []).reduce((acc, item) => acc + item.planned_amount, 0);

  async function save(values: Partial<PlannedExpense>) {
    if (editing) await mutations.update.mutateAsync({ id: editing.id, values });
    else await mutations.create.mutateAsync(values);
    setOpen(false);
    setEditing(null);
  }

  return (
    <Screen>
      <Header title="Custos planejados" subtitle={`Total previsto: ${money(total)}`} back onBack={() => router.replace("/(tabs)/more")} right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      <View style={styles.summary}>
        <Card><Text style={styles.kpi}>Pedro</Text><Text style={styles.amount}>{money((planned.data ?? []).filter((i) => i.owner_person === "pedro").reduce((a, i) => a + i.planned_amount, 0))}</Text></Card>
        <Card><Text style={styles.kpi}>Camilly</Text><Text style={styles.amount}>{money((planned.data ?? []).filter((i) => i.owner_person === "camilly").reduce((a, i) => a + i.planned_amount, 0))}</Text></Card>
      </View>
      <SectionHeader title="Lista" />
      {(planned.data ?? []).map((item) => (
        <Card key={item.id}>
          <Text style={styles.title}>{item.description}</Text>
          <Text style={styles.meta}>{personName(item.owner_person)} · {item.cost_type} · {item.status}</Text>
          <Text style={styles.amount}>{money(item.planned_amount)}</Text>
          <View style={styles.row}>
            <Button title="Editar" variant="secondary" onPress={() => { setEditing(item); setOpen(true); }} />
            <Button title="Excluir" variant="danger" onPress={() => mutations.remove.mutate(item.id)} />
          </View>
        </Card>
      ))}
      <AppModal visible={open} title={editing ? "Editar custo planejado" : "Novo custo planejado"} onClose={() => { setOpen(false); setEditing(null); }}>
        <PlannedExpenseForm trips={trips.data ?? []} categories={categories.data ?? []} initialValues={editing ?? undefined} onSubmit={save} loading={mutations.create.isPending || mutations.update.isPending} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  kpi: { color: theme.colors.muted, fontWeight: "800" },
  amount: { color: theme.colors.text, fontWeight: "900", fontSize: 20 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md }
});

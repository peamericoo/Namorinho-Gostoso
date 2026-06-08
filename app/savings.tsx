import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SavingsGoalForm } from "../src/components/forms/SavingsGoalForm";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { ProgressBar } from "../src/components/ui/ProgressBar";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";
import { useSavingsGoals, useSavingsMutations, useTrips } from "../src/hooks/useFinanceData";
import { savingsOverview, savingsProgress } from "../src/lib/calculations";
import { money, monthBR, personName } from "../src/lib/formatters";
import type { SavingsGoal } from "../src/types/models";

export default function SavingsScreen() {
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [open, setOpen] = useState(false);
  const goals = useSavingsGoals();
  const trips = useTrips();
  const mutations = useSavingsMutations();
  const overview = savingsOverview(goals.data ?? []);
  async function save(values: Partial<SavingsGoal>) {
    await mutations.save.mutateAsync(editing ? { ...editing, ...values } : values);
    setOpen(false);
    setEditing(null);
  }
  return (
    <Screen>
      <Header title="Economia e metas" subtitle={`Economizado ${money(overview.saved)} de ${money(overview.target)}`} back onBack={() => router.replace("/(tabs)/more")} right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      <Card>
        <Text style={styles.title}>Progresso das metas</Text>
        <ProgressBar value={overview.progress} tone={overview.progress >= 1 ? "success" : "couple"} />
        <Text style={styles.meta}>Faltam {money(overview.remaining)} · ritmo médio {money(overview.averageMonthly)}</Text>
      </Card>
      {(goals.data ?? []).map((goal) => {
        const progress = savingsProgress(goal);
        return (
          <Card key={goal.id}>
            <Text style={styles.title}>{personName(goal.person)} · {monthBR(goal.month)}</Text>
            <Text style={styles.meta}>{goal.notes}</Text>
            <ProgressBar value={progress.progress} tone={progress.progress >= 1 ? "success" : "warning"} />
            <Text style={styles.amount}>{money(goal.saved_amount)} de {money(goal.target_amount)}</Text>
            <View style={styles.row}>
              <Button title="Editar" variant="secondary" onPress={() => { setEditing(goal); setOpen(true); }} />
              <Button title="Excluir" variant="danger" onPress={() => mutations.remove.mutate(goal.id)} />
            </View>
          </Card>
        );
      })}
      <AppModal visible={open} title={editing ? "Editar meta" : "Nova meta"} onClose={() => { setOpen(false); setEditing(null); }}>
        <SavingsGoalForm trips={trips.data ?? []} initialValues={editing ?? undefined} onSubmit={(values) => void save(values)} loading={mutations.save.isPending} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  amount: { color: theme.colors.text, fontWeight: "900", fontSize: 18 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md }
});

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChecklistItemForm } from "../src/components/forms/ChecklistItemForm";
import { Badge } from "../src/components/ui/Badge";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { ProgressBar } from "../src/components/ui/ProgressBar";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";
import { useChecklistItems, useChecklistMutations, useTrips } from "../src/hooks/useFinanceData";
import { dateBR, personName } from "../src/lib/formatters";
import type { ChecklistItem } from "../src/types/models";

export default function ChecklistScreen() {
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = useChecklistItems();
  const trips = useTrips();
  const mutations = useChecklistMutations();
  const progress = items.data?.length ? (items.data.filter((item) => item.is_done).length / items.data.length) : 0;
  async function save(values: Partial<ChecklistItem>) {
    await mutations.save.mutateAsync(editing ? { ...editing, ...values } : values);
    setOpen(false);
    setEditing(null);
  }
  return (
    <Screen>
      <Header title="Checklist" subtitle="Itens por viagem, prazos e alertas." right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      <Card>
        <Text style={styles.title}>Progresso geral</Text>
        <ProgressBar value={progress} tone={progress === 1 ? "success" : "warning"} />
        <Text style={styles.meta}>{Math.round(progress * 100)}% concluído</Text>
      </Card>
      {(items.data ?? []).map((item) => (
        <Card key={item.id}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Badge label={item.is_done ? "Concluído" : "Pendente"} tone={item.is_done ? "success" : "warning"} />
          </View>
          <Text style={styles.meta}>{item.category} · {personName(item.responsible_person)} · prazo {dateBR(item.due_date)}</Text>
          <View style={styles.row}>
            <Button title={item.is_done ? "Reabrir" : "Concluir"} variant="secondary" onPress={() => mutations.save.mutate({ ...item, is_done: !item.is_done, status: item.is_done ? "pendente" : "concluido" })} />
            <Button title="Editar" variant="secondary" onPress={() => { setEditing(item); setOpen(true); }} />
            <Button title="Excluir" variant="danger" onPress={() => mutations.remove.mutate(item.id)} />
          </View>
        </Card>
      ))}
      <AppModal visible={open} title={editing ? "Editar item" : "Novo item"} onClose={() => { setOpen(false); setEditing(null); }}>
        <ChecklistItemForm trips={trips.data ?? []} initialValues={editing ?? undefined} onSubmit={(values) => void save(values)} loading={mutations.save.isPending} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2, flex: 1 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: theme.spacing.md }
});

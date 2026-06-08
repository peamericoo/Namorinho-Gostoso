import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItineraryItemForm } from "../src/components/forms/ItineraryItemForm";
import { Badge } from "../src/components/ui/Badge";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";
import { useItineraryItems, useItineraryMutations, useTrips } from "../src/hooks/useFinanceData";
import { dateBR, money, personName } from "../src/lib/formatters";
import type { ItineraryItem } from "../src/types/models";

export default function ItineraryScreen() {
  const [editing, setEditing] = useState<ItineraryItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = useItineraryItems();
  const trips = useTrips();
  const mutations = useItineraryMutations();
  async function save(values: Partial<ItineraryItem>) {
    await mutations.save.mutateAsync(editing ? { ...editing, ...values } : values);
    setOpen(false);
    setEditing(null);
  }
  const estimated = (items.data ?? []).reduce((a, item) => a + item.estimated_cost, 0);
  const actual = (items.data ?? []).reduce((a, item) => a + item.actual_cost, 0);
  return (
    <Screen>
      <Header title="Roteiro e agenda" subtitle={`Estimado ${money(estimated)} · Real ${money(actual)}`} right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      {(items.data ?? []).map((item) => (
        <Card key={item.id}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.activity}</Text>
            <Badge label={item.actual_cost > 0 || item.estimated_cost > 0 ? "Atividade paga" : "Gratuita"} tone={item.actual_cost > 0 || item.estimated_cost > 0 ? "warning" : "success"} />
          </View>
          <Text style={styles.meta}>{dateBR(item.date)} {item.time ? `às ${item.time}` : ""} · {item.location ?? "Sem local"}</Text>
          <Text style={styles.meta}>{personName(item.responsible_person)} · Estimado {money(item.estimated_cost)} · Real {money(item.actual_cost)}</Text>
          <View style={styles.row}>
            <Button title="Editar" variant="secondary" onPress={() => { setEditing(item); setOpen(true); }} />
            <Button title="Excluir" variant="danger" onPress={() => mutations.remove.mutate(item.id)} />
          </View>
        </Card>
      ))}
      <AppModal visible={open} title={editing ? "Editar atividade" : "Nova atividade"} onClose={() => { setOpen(false); setEditing(null); }}>
        <ItineraryItemForm trips={trips.data ?? []} initialValues={editing ?? undefined} onSubmit={(values) => void save(values)} loading={mutations.save.isPending} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2, flex: 1 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: theme.spacing.md }
});

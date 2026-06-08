import { router, useLocalSearchParams } from "expo-router";
import { Linking, StyleSheet, Text, View } from "react-native";
import { AlertBanner } from "../../../src/components/ui/AlertBanner";
import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Header } from "../../../src/components/ui/Header";
import { ProgressBar } from "../../../src/components/ui/ProgressBar";
import { Screen } from "../../../src/components/ui/Screen";
import { SettlementCard } from "../../../src/components/finance/SettlementCard";
import { theme } from "../../../src/constants/theme";
import { actualByTrip, plannedByTrip, tripSummary } from "../../../src/lib/calculations";
import { daysTogether } from "../../../src/lib/dates";
import { dateBR, money } from "../../../src/lib/formatters";
import { useChecklistItems, useExpenses, useItineraryItems, usePlannedExpenses, useTrip, useTripMutations } from "../../../src/hooks/useFinanceData";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(id);
  const expenses = useExpenses();
  const planned = usePlannedExpenses();
  const checklist = useChecklistItems();
  const itinerary = useItineraryItems();
  const mutations = useTripMutations();

  if (!trip.data) {
    return (
      <Screen>
        <Header title="Viagem" subtitle="Carregando detalhes..." />
      </Screen>
    );
  }

  const tripExpenses = (expenses.data ?? []).filter((item) => item.trip_id === trip.data.id);
  const tripPlanned = (planned.data ?? []).filter((item) => item.trip_id === trip.data.id);
  const tripChecklist = (checklist.data ?? []).filter((item) => item.trip_id === trip.data.id);
  const tripItinerary = (itinerary.data ?? []).filter((item) => item.trip_id === trip.data.id);
  const summary = tripSummary(trip.data, expenses.data ?? [], planned.data ?? []);
  const checklistProgress = tripChecklist.length ? tripChecklist.filter((item) => item.is_done).length / tripChecklist.length : 0;

  async function remove() {
    await mutations.remove.mutateAsync(trip.data!.id);
    router.replace("/(tabs)/trips");
  }

  return (
    <Screen>
      <Header title={trip.data.title} subtitle={`${trip.data.origin_city} → ${trip.data.destination_city}`} />
      <Card>
        <View style={styles.row}>
          <Badge label={trip.data.status} tone={trip.data.status === "concluida" ? "success" : "neutral"} />
          <Badge label={`Prioridade ${trip.data.priority}`} tone={trip.data.priority === "alta" ? "warning" : "neutral"} />
        </View>
        <Text style={styles.title}>{dateBR(trip.data.start_date)} - {dateBR(trip.data.end_date)}</Text>
        <Text style={styles.meta}>{daysTogether(trip.data.start_date, trip.data.end_date)} dias juntos · {trip.data.direction}</Text>
        <Text style={styles.meta}>{trip.data.purpose}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>Resumo financeiro</Text>
        <Text style={styles.big}>{money(actualByTrip(trip.data.id, expenses.data ?? []))}</Text>
        <Text style={styles.meta}>Planejado: {money(trip.data.planned_budget || plannedByTrip(trip.data.id, planned.data ?? []))}</Text>
        <Text style={styles.meta}>Diferença: {money(summary.difference)} · Custo por dia: {money(summary.costPerDay)}</Text>
        <ProgressBar value={summary.usage} tone={summary.usage > 1 ? "danger" : "success"} />
      </Card>

      {summary.usage > 1 ? <AlertBanner tone="danger" message="Esta viagem está acima do orçamento planejado." /> : null}
      {!trip.data.tickets_url ? <AlertBanner message="Passagem ainda não cadastrada." /> : null}
      {!trip.data.accommodation_url ? <AlertBanner message="Hospedagem ainda não cadastrada." /> : null}

      <SettlementCard expenses={tripExpenses} />

      <Card>
        <Text style={styles.title}>Checklist</Text>
        <ProgressBar value={checklistProgress} tone={checklistProgress === 1 ? "success" : "warning"} />
        <Text style={styles.meta}>{tripChecklist.filter((item) => item.is_done).length} de {tripChecklist.length} itens concluídos.</Text>
        <Button title="Abrir checklist" variant="secondary" onPress={() => router.push("/checklist")} />
      </Card>

      <Card>
        <Text style={styles.title}>Roteiro e gastos</Text>
        <Text style={styles.meta}>{tripPlanned.length} custos planejados · {tripExpenses.length} gastos reais · {tripItinerary.length} atividades</Text>
        <View style={styles.row}>
          <Button title="Custos planejados" variant="secondary" onPress={() => router.push("/planned-expenses")} />
          <Button title="Roteiro" variant="secondary" onPress={() => router.push("/itinerary")} />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Links</Text>
        {[
          ["Passagens", trip.data.tickets_url],
          ["Hospedagem", trip.data.accommodation_url],
          ["Roteiro", trip.data.itinerary_url]
        ].map(([label, url]) => (
          <Button key={label} title={url ? `Abrir ${label}` : `${label} não cadastrado`} variant="secondary" disabled={!url} onPress={() => url && Linking.openURL(url)} />
        ))}
      </Card>

      <View style={styles.row}>
        <Button title="Editar" onPress={() => router.push(`/trips/${trip.data?.id}/edit`)} />
        <Button title="Excluir" variant="danger" loading={mutations.remove.isPending} onPress={remove} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  big: { color: theme.colors.text, fontWeight: "900", fontSize: 30 },
  meta: { color: theme.colors.muted, fontWeight: "700", lineHeight: 21 }
});

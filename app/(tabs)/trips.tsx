import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TripCard } from "../../src/components/finance/TripCard";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { Select } from "../../src/components/ui/Select";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { labelStatus } from "../../src/constants/categories";
import { theme } from "../../src/constants/theme";
import { useExpenses, usePlannedExpenses, useTrips } from "../../src/hooks/useFinanceData";
import { isSharedTrip } from "../../src/lib/productFlow";
import { getEffectiveTripStatus } from "../../src/lib/tripLifecycle";
import { useFiltersStore } from "../../src/store/filters.store";

type DirectionFilter = "todos" | "pedro_to_camilly" | "camilly_to_pedro" | "shared_destination";

export default function TripsScreen() {
  const trips = useTrips();
  const expenses = useExpenses();
  const planned = usePlannedExpenses();
  const filters = useFiltersStore();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("todos");
  const filtered = useMemo(() => {
    const search = filters.tripSearch.toLowerCase();
    return (trips.data ?? []).filter((trip) => {
      const effectiveStatus = getEffectiveTripStatus(trip);
      const statusOk = filters.statusFilter === "todos" || effectiveStatus === filters.statusFilter;
      const sharedTrip = isSharedTrip(trip);
      const directionOk =
        directionFilter === "todos" ||
        (directionFilter === "shared_destination" && sharedTrip) ||
        (directionFilter === "pedro_to_camilly" && !sharedTrip && trip.traveler_person === "pedro") ||
        (directionFilter === "camilly_to_pedro" && !sharedTrip && trip.traveler_person === "camilly");
      const searchOk = !search || `${trip.title} ${trip.origin_city} ${trip.destination_city}`.toLowerCase().includes(search);
      return statusOk && directionOk && searchOk;
    });
  }, [directionFilter, filters.statusFilter, filters.tripSearch, trips.data]);

  return (
    <Screen>
      <Header title="Linha do tempo do casal" subtitle="Planeje próximos encontros e registre viagens já realizadas." right={<Button title="Adicionar" onPress={() => router.push("/trips/new")} />} />
      <View style={styles.filters}>
        <Input label="Buscar" value={filters.tripSearch} onChangeText={filters.setTripSearch} placeholder="Nome, cidade ou destino" />
        <Select
          label="Status"
          value={filters.statusFilter}
          onChange={filters.setStatusFilter}
          options={[
            { label: "Todos", value: "todos" },
            ...["planejada", "em_andamento", "concluida", "cancelada", "adiada"].map((status) => ({ label: labelStatus(status), value: status }))
          ]}
        />
        <Select
          label="Direção"
          value={directionFilter}
          onChange={(value) => setDirectionFilter(value as DirectionFilter)}
          options={[
            { label: "Todos", value: "todos" },
            { label: "Pedro → Camilly", value: "pedro_to_camilly" },
            { label: "Camilly → Pedro", value: "camilly_to_pedro" },
            { label: "Pedro e Camilly", value: "shared_destination" }
          ]}
        />
      </View>
      {!trips.isLoading && filtered.length > 0 ? <Text style={styles.timelineHint}>{filtered.length} encontro(s) no histórico compartilhado.</Text> : null}
      {trips.isLoading ? <Skeleton height={160} /> : filtered.length === 0 ? (
        <EmptyState title="Nenhum encontro encontrado" message="Crie a primeira viagem do casal ou ajuste os filtros para ver o histórico completo." actionLabel="Nova viagem" onAction={() => router.push("/trips/new")} />
      ) : (
        <View style={styles.timeline}>
          {filtered.map((trip) => (
            <View key={trip.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineCard}>
                <TripCard trip={trip} expenses={expenses.data ?? []} plannedExpenses={planned.data ?? []} onPress={() => router.push(`/trips/${trip.id}`)} />
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: theme.spacing.md },
  timelineHint: { color: theme.colors.muted, fontWeight: "800" },
  timeline: { gap: theme.spacing.md },
  timelineItem: { flexDirection: "row", gap: theme.spacing.md },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.coupleStrong,
    marginTop: theme.spacing.xl
  },
  timelineCard: { flex: 1 }
});

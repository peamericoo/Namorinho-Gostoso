import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
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
import { useFiltersStore } from "../../src/store/filters.store";

export default function TripsScreen() {
  const trips = useTrips();
  const expenses = useExpenses();
  const planned = usePlannedExpenses();
  const filters = useFiltersStore();
  const filtered = useMemo(() => {
    const search = filters.tripSearch.toLowerCase();
    return (trips.data ?? []).filter((trip) => {
      const statusOk = filters.statusFilter === "todos" || trip.status === filters.statusFilter;
      const searchOk = !search || `${trip.title} ${trip.origin_city} ${trip.destination_city}`.toLowerCase().includes(search);
      return statusOk && searchOk;
    });
  }, [filters.statusFilter, filters.tripSearch, trips.data]);

  return (
    <Screen>
      <Header title="Viagens" subtitle="Planeje, acompanhe e compare cada visita." right={<Button title="Adicionar" onPress={() => router.push("/trips/new")} />} />
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
      </View>
      {trips.isLoading ? <Skeleton height={160} /> : filtered.length === 0 ? (
        <EmptyState title="Nenhuma viagem encontrada" message="Cadastre a próxima visita para começar o planejamento." actionLabel="Nova viagem" onAction={() => router.push("/trips/new")} />
      ) : (
        filtered.map((trip) => <TripCard key={trip.id} trip={trip} expenses={expenses.data ?? []} plannedExpenses={planned.data ?? []} onPress={() => router.push(`/trips/${trip.id}`)} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: theme.spacing.md }
});

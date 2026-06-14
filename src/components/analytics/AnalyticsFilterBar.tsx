import { StyleSheet, View } from "react-native";
import { labelPerson } from "../../constants/categories";
import { theme } from "../../constants/theme";
import type { Trip } from "../../types/models";
import { DateInput } from "../ui/DateInput";
import { Select } from "../ui/Select";
import { SegmentedTabs } from "../ui/SegmentedTabs";

export type AnalyticsMetricMode = "realizado" | "planejado" | "acerto";
export type AnalyticsViewMode = "categoria" | "pessoa" | "viagem";

export type AnalyticsFilters = {
  tripId: string;
  dateFrom: string;
  dateTo: string;
  person: string;
  metricMode: AnalyticsMetricMode;
  viewMode: AnalyticsViewMode;
};

export function AnalyticsFilterBar({
  filters,
  trips,
  isWide,
  onChange
}: {
  filters: AnalyticsFilters;
  trips: Trip[];
  isWide?: boolean;
  onChange: (filters: AnalyticsFilters) => void;
}) {
  function update<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        <Select
          label="Viagem"
          value={filters.tripId}
          onChange={(value) => update("tripId", value)}
          options={[{ label: "Todas", value: "todos" }, ...trips.map((trip) => ({ label: trip.title, value: trip.id }))]}
        />
        <Select
          label="Pessoa"
          value={filters.person}
          onChange={(value) => update("person", value)}
          options={[
            { label: "Todos", value: "todos" },
            { label: labelPerson("pedro"), value: "pedro" },
            { label: labelPerson("camilly"), value: "camilly" },
            { label: labelPerson("ambos"), value: "ambos" }
          ]}
        />
        <DateInput label="De" value={filters.dateFrom} onChangeText={(value) => update("dateFrom", value)} />
        <DateInput label="Até" value={filters.dateTo} onChangeText={(value) => update("dateTo", value)} />
      </View>
      <SegmentedTabs
        accessibilityLabel="Métrica principal"
        value={filters.metricMode}
        onChange={(value) => update("metricMode", value)}
        options={[
          { label: "Realizado", value: "realizado" },
          { label: "Planejado", value: "planejado" },
          { label: "Acerto", value: "acerto" }
        ]}
      />
      <SegmentedTabs
        accessibilityLabel="Agrupamento das análises"
        value={filters.viewMode}
        onChange={(value) => update("viewMode", value)}
        options={[
          { label: "Categoria", value: "categoria" },
          { label: "Pessoa", value: "pessoa" },
          { label: "Viagem", value: "viagem" }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.md
  },
  grid: {
    gap: theme.spacing.md
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});

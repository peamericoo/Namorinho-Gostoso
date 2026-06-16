import { RotateCcw } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { labelPerson } from "../../constants/categories";
import { theme } from "../../constants/theme";
import type { Trip } from "../../types/models";
import { DateInput } from "../ui/DateInput";
import { Select } from "../ui/Select";

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
  onChange,
  onReset
}: {
  filters: AnalyticsFilters;
  trips: Trip[];
  isWide?: boolean;
  onChange: (filters: AnalyticsFilters) => void;
  onReset?: () => void;
}) {
  function update<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, isWide && styles.rowWide]}>
        <View style={[styles.control, isWide && styles.selectControl]}>
          <Select
            label="Viagens"
            value={filters.tripId}
            onChange={(value) => update("tripId", value)}
            options={[{ label: "Todas", value: "todos" }, ...trips.map((trip) => ({ label: trip.title, value: trip.id }))]}
          />
        </View>
        <View style={[styles.control, isWide && styles.selectControl]}>
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
        </View>
        <View style={[styles.control, isWide && styles.dateControl]}>
          <DateInput label="De" value={filters.dateFrom} onChangeText={(value) => update("dateFrom", value)} />
        </View>
        <View style={[styles.control, isWide && styles.dateControl]}>
          <DateInput label="Até" value={filters.dateTo} onChangeText={(value) => update("dateTo", value)} />
        </View>
        <View style={[styles.segmentGroup, isWide && styles.metricGroup]}>
          <Text style={styles.groupLabel}>Tipo de análise</Text>
          <FilterSegmentedTabs
            accessibilityLabel="Métrica principal"
            value={filters.metricMode}
            onChange={(value) => update("metricMode", value)}
            options={[
              { label: "Realizado", value: "realizado" },
              { label: "Planejado", value: "planejado" },
              { label: "Acerto", value: "acerto" }
            ]}
          />
        </View>
        <View style={[styles.segmentGroup, isWide && styles.viewGroup]}>
          <Text style={styles.groupLabel}>Categoria</Text>
          <FilterSegmentedTabs
            accessibilityLabel="Agrupamento das análises"
            value={filters.viewMode}
            onChange={(value) => update("viewMode", value)}
            options={[
              { label: "Todas", value: "categoria" },
              { label: "Pessoa", value: "pessoa" },
              { label: "Viagem", value: "viagem" }
            ]}
          />
        </View>
        {onReset ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar filtros" onPress={onReset} style={({ pressed }) => [styles.reset, pressed && styles.resetPressed]}>
            <RotateCcw color={theme.colors.coupleStrong} size={16} strokeWidth={2.4} />
            <Text style={styles.resetText}>Limpar filtros</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function FilterSegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.segmentedItem, active && styles.segmentedItemActive, pressed && styles.segmentedItemPressed]}
          >
            <Text style={[styles.segmentedText, active && styles.segmentedTextActive]} numberOfLines={1}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.md
  },
  row: {
    gap: theme.spacing.md
  },
  rowWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end"
  },
  control: {
    minWidth: 0
  },
  selectControl: {
    width: 145
  },
  dateControl: {
    width: 150
  },
  segmentGroup: {
    gap: theme.spacing.xs,
    minWidth: 0
  },
  metricGroup: {
    width: 205
  },
  viewGroup: {
    width: 175
  },
  groupLabel: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17
  },
  reset: {
    minHeight: 46,
    width: 130,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm
  },
  resetPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: theme.colors.focusRing
  },
  resetText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  segmented: {
    minHeight: 46,
    padding: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  segmentedItem: {
    flex: 1,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9
  },
  segmentedItemActive: {
    backgroundColor: "#FFE7EB"
  },
  segmentedItemPressed: {
    opacity: 0.72
  },
  segmentedText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  segmentedTextActive: {
    color: "#FF3F5F"
  }
});

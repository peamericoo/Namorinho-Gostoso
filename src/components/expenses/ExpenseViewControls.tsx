import { StyleSheet, View } from "react-native";
import type { ExpensePersonGrouping, ExpenseViewMode } from "../../lib/expenseFilters";
import { SegmentedTabs } from "../ui/SegmentedTabs";

export function ExpenseViewControls({
  viewMode,
  personGrouping,
  onViewModeChange,
  onPersonGroupingChange
}: {
  viewMode: ExpenseViewMode;
  personGrouping: ExpensePersonGrouping;
  onViewModeChange: (mode: ExpenseViewMode) => void;
  onPersonGroupingChange: (mode: ExpensePersonGrouping) => void;
}) {
  return (
    <View style={styles.wrap}>
      <SegmentedTabs
        accessibilityLabel="Visualização de gastos"
        value={viewMode}
        onChange={onViewModeChange}
        options={[
          { label: "Todos", value: "todos" },
          { label: "Categoria", value: "categoria" },
          { label: "Pessoa", value: "pessoa" },
          { label: "Viagem", value: "viagem" },
          { label: "Data", value: "data" },
          { label: "Tipo", value: "tipo" }
        ]}
      />
      {viewMode === "pessoa" ? (
        <SegmentedTabs
          accessibilityLabel="Agrupamento por pessoa"
          value={personGrouping}
          onChange={onPersonGroupingChange}
          options={[
            { label: "Pago por", value: "paid_by" },
            { label: "Beneficiário", value: "beneficiary" }
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  }
});

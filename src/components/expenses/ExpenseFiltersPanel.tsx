import { StyleSheet, View } from "react-native";
import { costTypes, labelPerson, labelStatus } from "../../constants/categories";
import { theme } from "../../constants/theme";
import type { Category, Trip } from "../../types/models";
import type { ExpenseFilters, ExpenseReimbursableMode, ExpenseSplitMode } from "../../lib/expenseFilters";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";

export function ExpenseFiltersPanel({
  filters,
  trips,
  categories,
  paymentMethods,
  isWide,
  onChange,
  onReset
}: {
  filters: ExpenseFilters;
  trips: Trip[];
  categories: Category[];
  paymentMethods: string[];
  isWide?: boolean;
  onChange: (filters: ExpenseFilters) => void;
  onReset: () => void;
}) {
  function update<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <View style={styles.panel}>
      <View style={[styles.grid, isWide && styles.gridWide]}>
        <Select
          label="Viagem"
          value={filters.tripId}
          onChange={(value) => update("tripId", value)}
          options={[{ label: "Todas", value: "todos" }, ...trips.map((trip) => ({ label: trip.title, value: trip.id }))]}
        />
        <Select
          label="Categoria"
          value={filters.categoryId}
          onChange={(value) => update("categoryId", value)}
          options={[{ label: "Todas", value: "todos" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]}
        />
        <Select
          label="Pago por"
          value={filters.paidBy}
          onChange={(value) => update("paidBy", value)}
          options={[
            { label: "Todos", value: "todos" },
            { label: "Pedro", value: "pedro" },
            { label: "Camilly", value: "camilly" }
          ]}
        />
        <Select
          label="Beneficiário"
          value={filters.beneficiary}
          onChange={(value) => update("beneficiary", value)}
          options={[
            { label: "Todos", value: "todos" },
            { label: labelPerson("pedro"), value: "pedro" },
            { label: labelPerson("camilly"), value: "camilly" },
            { label: labelPerson("ambos"), value: "ambos" }
          ]}
        />
        <Select
          label="Tipo de custo"
          value={filters.costType}
          onChange={(value) => update("costType", value)}
          options={[{ label: "Todos", value: "todos" }, ...costTypes.map((type) => ({ label: labelStatus(type), value: type }))]}
        />
        <Select
          label="Pagamento"
          value={filters.paymentMethod}
          onChange={(value) => update("paymentMethod", value)}
          options={[{ label: "Todos", value: "todos" }, ...paymentMethods.map((method) => ({ label: method, value: method }))]}
        />
        <DateInput label="De" value={filters.dateFrom} onChangeText={(value) => update("dateFrom", value)} />
        <DateInput label="Até" value={filters.dateTo} onChangeText={(value) => update("dateTo", value)} />
        <MoneyInput label="Valor mínimo" value={filters.minAmount} onChangeText={(value) => update("minAmount", value)} />
        <MoneyInput label="Valor máximo" value={filters.maxAmount} onChangeText={(value) => update("maxAmount", value)} />
        <Select
          label="Divisão"
          value={filters.splitMode}
          onChange={(value) => update("splitMode", value as ExpenseSplitMode)}
          options={[
            { label: "Todos", value: "todos" },
            { label: "Compartilhados", value: "shared" },
            { label: "Individuais", value: "individual" }
          ]}
        />
        <Select
          label="Reembolso"
          value={filters.reimbursableMode}
          onChange={(value) => update("reimbursableMode", value as ExpenseReimbursableMode)}
          options={[
            { label: "Todos", value: "todos" },
            { label: "Reembolsáveis", value: "reimbursable" },
            { label: "Não reembolsáveis", value: "not_reimbursable" }
          ]}
        />
      </View>
      <View style={styles.actions}>
        <Button
          title="Viagens acima do orçamento"
          variant={filters.overBudgetOnly ? "primary" : "secondary"}
          onPress={() => update("overBudgetOnly", !filters.overBudgetOnly)}
          style={styles.action}
        />
        <Button title="Limpar filtros" variant="ghost" onPress={onReset} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: theme.spacing.md
  },
  grid: {
    gap: theme.spacing.md
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  action: {
    flexGrow: 1
  }
});

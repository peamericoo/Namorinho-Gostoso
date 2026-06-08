import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import type { Category, Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function SpendingByCategoryChart({ expenses, categories }: { expenses: Expense[]; categories: Category[] }) {
  const rows = categories
    .map((category) => ({
      label: category.name,
      color: category.color,
      value: expenses.filter((expense) => expense.category_id === category.id).reduce((acc, expense) => acc + expense.amount, 0)
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ChartCard title="Gastos por categoria">
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <View style={styles.labelWrap}>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <Text style={styles.label}>{row.label}</Text>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${(row.value / max) * 100}%`, backgroundColor: row.color }]} /></View>
          <Text style={styles.value}>{money(row.value)}</Text>
        </View>
      ))}
      {rows.length === 0 ? <Text style={styles.empty}>Registre gastos para ver o gráfico.</Text> : null}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  labelWrap: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { color: theme.colors.text, fontWeight: "800" },
  track: { height: 9, borderRadius: theme.radius.pill, backgroundColor: theme.colors.line, overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill },
  value: { color: theme.colors.muted, fontWeight: "800" },
  empty: { color: theme.colors.muted, fontWeight: "700" }
});

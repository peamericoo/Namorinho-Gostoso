import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import type { Category, Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function SpendingByCategoryChart({ expenses, categories, framed = true }: { expenses: Expense[]; categories: Category[]; framed?: boolean }) {
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

  const content = (
    <>
      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label} numberOfLines={1}>{row.label}</Text>
              <Text style={styles.value}>{money(row.value)}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(row.value / max) * 100}%`, backgroundColor: row.color }]} />
            </View>
          </View>
        ))}
      </View>
      {rows.length === 0 ? <Text style={styles.empty}>Registre gastos para ver o gráfico.</Text> : null}
    </>
  );

  if (!framed) return <View style={styles.embedded}>{content}</View>;

  return (
    <ChartCard title="Gastos por categoria">
      {content}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  embedded: { gap: theme.spacing.md },
  list: { gap: 12 },
  row: { gap: 7 },
  copy: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md },
  label: { flex: 1, color: "#111827", fontWeight: "900", fontSize: 13, lineHeight: 17 },
  track: { height: 9, borderRadius: theme.radius.pill, backgroundColor: "#EEF2F7", overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill },
  value: { color: "#334155", fontWeight: "800", fontSize: 12 },
  empty: { color: theme.colors.muted, fontWeight: "700" }
});

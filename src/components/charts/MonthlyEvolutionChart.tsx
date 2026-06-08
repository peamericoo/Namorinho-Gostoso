import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function MonthlyEvolutionChart({ expenses }: { expenses: Expense[] }) {
  const groups = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = format(parseISO(expense.spent_at), "MMM/yy", { locale: ptBR });
    groups.set(key, (groups.get(key) ?? 0) + expense.amount);
  });
  const rows = Array.from(groups.entries()).map(([label, value]) => ({ label, value })).slice(-6);
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ChartCard title="Evolução mensal">
      <View style={styles.bars}>
        {rows.map((row) => (
          <View key={row.label} style={styles.item}>
            <View style={styles.barBox}>
              <View style={[styles.bar, { height: `${Math.max((row.value / max) * 100, 8)}%` }]} />
            </View>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{money(row.value)}</Text>
          </View>
        ))}
      </View>
      {rows.length === 0 ? <Text style={styles.empty}>Sem gastos mensais ainda.</Text> : null}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: "row", alignItems: "flex-end", gap: theme.spacing.sm, minHeight: 150 },
  item: { flex: 1, alignItems: "center", gap: 6 },
  barBox: { height: 96, width: "100%", borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt, justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", backgroundColor: theme.colors.coupleStrong, borderRadius: theme.radius.md },
  label: { color: theme.colors.text, fontWeight: "800", fontSize: 11 },
  value: { color: theme.colors.muted, fontWeight: "700", fontSize: 10 },
  empty: { color: theme.colors.muted, fontWeight: "700" }
});

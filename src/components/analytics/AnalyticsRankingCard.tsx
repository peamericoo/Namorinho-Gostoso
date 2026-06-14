import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { dateBR, money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { Badge } from "../ui/Badge";
import { AnalyticsWidget } from "./AnalyticsWidget";

export function AnalyticsRankingCard({ expenses }: { expenses: Expense[] }) {
  const rows = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 6);
  return (
    <AnalyticsWidget title="Maiores gastos" subtitle="Ranking dos registros que mais pesaram no período.">
      <View style={styles.list}>
        {rows.length === 0 ? <Text style={styles.empty}>Sem gastos para ranquear.</Text> : null}
        {rows.map((expense, index) => (
          <View key={expense.id} style={styles.row}>
            <View style={styles.position}>
              <Text style={styles.positionText}>{index + 1}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{expense.description}</Text>
              <Text style={styles.meta}>{dateBR(expense.spent_at)} · {expense.category?.name ?? "Sem categoria"} · {expense.trip?.title ?? "Sem viagem"}</Text>
              <View style={styles.badges}>
                <Badge label={expense.should_split ? "Dividido" : "Individual"} tone={expense.should_split ? "success" : "neutral"} />
                {expense.payment_method ? <Badge label={expense.payment_method} tone="couple" /> : null}
              </View>
            </View>
            <Text style={styles.amount}>{money(expense.amount)}</Text>
          </View>
        ))}
      </View>
    </AnalyticsWidget>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md
  },
  empty: {
    color: theme.colors.muted,
    fontWeight: "700"
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingBottom: theme.spacing.md
  },
  position: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.couple
  },
  positionText: {
    color: theme.colors.coupleStrong,
    fontWeight: "900"
  },
  copy: {
    flex: 1,
    gap: 4
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 18
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs
  },
  amount: {
    color: theme.colors.text,
    fontWeight: "900"
  }
});

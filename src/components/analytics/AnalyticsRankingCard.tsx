import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { dateBR, money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { AnalyticsWidget } from "./AnalyticsWidget";

export function AnalyticsRankingCard({ expenses, onViewAll, style }: { expenses: Expense[]; onViewAll?: () => void; style?: StyleProp<ViewStyle> }) {
  const rows = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 6);
  return (
    <AnalyticsWidget title="Maiores gastos" subtitle="Ranking dos registros que mais pesaram no período." style={style}>
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
            </View>
            <Text style={styles.amount}>{money(expense.amount)}</Text>
          </View>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os gastos" onPress={onViewAll} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Text style={styles.ctaText}>Ver todos os gastos</Text>
        </Pressable>
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
    minHeight: 63,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingBottom: theme.spacing.sm
  },
  position: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.couple
  },
  positionText: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    fontSize: 12
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  title: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900"
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 11,
    lineHeight: 16
  },
  amount: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900"
  },
  cta: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  ctaPressed: {
    transform: [{ scale: 0.992 }],
    borderColor: theme.colors.focusRing
  },
  ctaText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900"
  }
});

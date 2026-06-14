import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import type { ExpenseSummary as ExpenseSummaryData } from "../../lib/expenseFilters";
import { money } from "../../lib/formatters";
import { Card } from "../ui/Card";

export function ExpenseSummary({ summary }: { summary: ExpenseSummaryData }) {
  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Resumo dos filtros</Text>
          <Text style={styles.title}>{money(summary.total)}</Text>
        </View>
        <Text style={styles.count}>{summary.count} gasto(s)</Text>
      </View>
      <View style={styles.grid}>
        <Metric label="Maior gasto" value={summary.largestExpense ? money(summary.largestExpense.amount) : money(0)} helper={summary.largestExpense?.description ?? "Sem gastos"} />
        <Metric label="Categoria líder" value={summary.topCategory ? money(summary.topCategory.amount) : money(0)} helper={summary.topCategory?.label ?? "Sem categoria"} />
        <Metric label="Pedro pagou" value={money(summary.paidByPedro)} helper="Total desembolsado" tone="pedro" />
        <Metric label="Camilly pagou" value={money(summary.paidByCamilly)} helper="Total desembolsado" tone="camilly" />
        <Metric label="Compartilhado" value={money(summary.sharedTotal)} helper="Gastos divididos" tone="couple" />
        <Metric label="Acerto estimado" value={money(summary.settlement.amount)} helper={summary.settlement.message} tone={summary.settlement.amount > 0 ? "warning" : "success"} />
      </View>
    </Card>
  );
}

function Metric({
  label,
  value,
  helper,
  tone = "neutral"
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "pedro" | "camilly" | "couple" | "warning" | "success";
}) {
  return (
    <View style={[styles.metric, tone !== "neutral" && styles[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper} numberOfLines={2}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  eyebrow: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 12
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 30
  },
  count: {
    color: theme.colors.muted,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metric: {
    flex: 1,
    minWidth: 145,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    padding: theme.spacing.md,
    gap: 2
  },
  pedro: {
    backgroundColor: theme.colors.pedro
  },
  camilly: {
    backgroundColor: theme.colors.camilly
  },
  couple: {
    backgroundColor: theme.colors.couple
  },
  warning: {
    backgroundColor: theme.colors.warning
  },
  success: {
    backgroundColor: theme.colors.success
  },
  metricLabel: {
    color: theme.colors.muted,
    fontWeight: "900",
    fontSize: theme.typography.small
  },
  metricValue: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 19
  },
  metricHelper: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small,
    lineHeight: 16
  }
});

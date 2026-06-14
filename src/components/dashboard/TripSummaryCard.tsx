import { CalendarDays, MapPin } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { labelStatus } from "../../constants/categories";
import { theme } from "../../constants/theme";
import { plannedByTrip, tripSummary } from "../../lib/calculations";
import { daysTogether } from "../../lib/dates";
import { dateBR, money, percent } from "../../lib/formatters";
import { tripDirectionChip, tripTravelerLabel } from "../../lib/productFlow";
import { getEffectiveTripStatus } from "../../lib/tripLifecycle";
import type { Expense, PlannedExpense, Trip } from "../../types/models";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { MoneyDeltaBadge } from "./MoneyDeltaBadge";

export function TripSummaryCard({
  trip,
  expenses,
  plannedExpenses,
  onOpenTrip
}: {
  trip: Trip;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  onOpenTrip: () => void;
}) {
  const summary = tripSummary(trip, expenses, plannedExpenses);
  const plannedRows = plannedExpenses.filter((item) => item.trip_id === trip.id);
  const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
  const status = getEffectiveTripStatus(trip);
  const overBudget = planned > 0 && summary.actual > planned;

  return (
    <Card style={styles.card} onPress={onOpenTrip} accessibilityLabel={`Abrir viagem ${trip.title}`}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Viagem selecionada</Text>
          <Text style={styles.title}>{trip.title}</Text>
          <View style={styles.metaRow}>
            <MapPin size={17} color={theme.colors.coupleStrong} />
            <Text style={styles.meta}>{trip.origin_city}{" -> "}{trip.destination_city}</Text>
          </View>
          <View style={styles.metaRow}>
            <CalendarDays size={17} color={theme.colors.coupleStrong} />
            <Text style={styles.meta}>{dateBR(trip.start_date)} - {dateBR(trip.end_date)} · {daysTogether(trip.start_date, trip.end_date)} dias</Text>
          </View>
        </View>
        <View style={styles.badges}>
          <Badge label={labelStatus(status)} tone={overBudget ? "danger" : status === "concluida" ? "success" : "couple"} />
          <Badge label={tripDirectionChip(trip)} tone="neutral" />
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Planejado" value={money(planned)} helper={plannedRows.length ? `${plannedRows.length} custo(s)` : "Orçamento da viagem"} />
        <Metric label="Realizado" value={money(summary.actual)} helper={`${expenses.filter((expense) => expense.trip_id === trip.id).length} gasto(s)`} />
        <Metric label="Diferença" value={money(summary.difference)} helper={overBudget ? "Passou do limite" : "Ainda disponível"} tone={overBudget ? "danger" : "success"} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Uso do orçamento</Text>
          <MoneyDeltaBadge value={summary.difference} />
        </View>
        <ProgressBar value={summary.usage} tone={summary.usage > 1 ? "danger" : summary.usage > 0.8 ? "warning" : "success"} />
        <Text style={styles.meta}>Quem viaja: {tripTravelerLabel(trip)} · {percent(Math.min(summary.usage, 1) * 100)} usado · custo por dia {money(summary.costPerDay)}</Text>
      </View>
    </Card>
  );
}

function Metric({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "success" | "danger" }) {
  return (
    <View style={[styles.metric, tone === "success" && styles.metricSuccess, tone === "danger" && styles.metricDanger]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  titleWrap: {
    flex: 1,
    gap: 4
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
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20
  },
  badges: {
    alignItems: "flex-end",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.spacing.xs
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metric: {
    flex: 1,
    minWidth: 132,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    padding: theme.spacing.sm,
    gap: 2
  },
  metricSuccess: {
    backgroundColor: theme.colors.success,
    borderColor: "#BBF7D0"
  },
  metricDanger: {
    backgroundColor: theme.colors.danger,
    borderColor: "#FCA5A5"
  },
  metricLabel: {
    color: theme.colors.muted,
    fontWeight: "900",
    fontSize: theme.typography.small
  },
  metricValue: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  metricHelper: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small
  },
  progressBlock: {
    gap: theme.spacing.sm
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  progressLabel: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  action: { flexGrow: 1 }
});

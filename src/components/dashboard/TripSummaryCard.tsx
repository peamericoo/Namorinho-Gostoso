import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { ImageBackground, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
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
import { dashboardTripTitle } from "./dashboardPresentation";
import { MoneyDeltaBadge } from "./MoneyDeltaBadge";

type TripSummaryCardProps = {
  trip: Trip;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  onOpenTrip: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TripSummaryCard({ trip, expenses, plannedExpenses, onOpenTrip, style }: TripSummaryCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const summary = tripSummary(trip, expenses, plannedExpenses);
  const plannedRows = plannedExpenses.filter((item) => item.trip_id === trip.id);
  const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
  const status = getEffectiveTripStatus(trip);
  const overBudget = summary.difference < 0;
  const locationLabel = `${trip.origin_city} -> ${trip.destination_city}`;
  const title = dashboardTripTitle(trip.title);

  return (
    <Card style={styles.card} wrapperStyle={style} onPress={onOpenTrip} accessibilityLabel={`Abrir viagem ${trip.title}`}>
      <View style={[styles.layout, isCompact && styles.layoutCompact]}>
        <ImageBackground source={{ uri: travelImageUrl }} resizeMode="cover" imageStyle={styles.imageRadius} style={[styles.image, isCompact && styles.imageCompact]}>
          <View style={styles.imageScrim} />
          <View style={styles.locationChip}>
            <MapPin size={18} color={palette.primary} strokeWidth={2.7} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.topLine}>
            <Badge label={labelStatus(status)} tone={overBudget ? "danger" : status === "concluida" ? "success" : "couple"} />
            <View style={styles.travelers}>
              <Users size={18} color={palette.ink} strokeWidth={2.4} />
              <Text style={styles.travelersText} numberOfLines={1}>
                {tripDirectionChip(trip)}
              </Text>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.metaRow}>
              <CalendarDays size={19} color={palette.primary} strokeWidth={2.6} />
              <Text style={styles.meta} numberOfLines={1}>
                {dateBR(trip.start_date)} - {dateBR(trip.end_date)} · {daysTogether(trip.start_date, trip.end_date)} dias
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="Planejado" value={money(planned)} helper={plannedRows.length ? `${plannedRows.length} custo(s)` : "Orçamento da viagem"} />
            <Metric label="Realizado" value={money(summary.actual)} helper={`${expenses.filter((expense) => expense.trip_id === trip.id).length} gasto(s)`} />
            <Metric label="Diferença" value={money(summary.difference)} helper={overBudget ? "Acima do limite" : "Ainda disponível"} tone={overBudget ? "danger" : "success"} />
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Uso do orçamento</Text>
              <MoneyDeltaBadge value={summary.difference} />
            </View>
            <ProgressBar value={summary.usage} tone={summary.usage > 1 ? "danger" : summary.usage > 0.8 ? "warning" : "success"} />
            <Text style={styles.meta} numberOfLines={2}>
              Quem viaja: {tripTravelerLabel(trip)} · {percent(Math.min(summary.usage, 1) * 100)} usado · Custo por dia: {money(summary.costPerDay)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

function Metric({ label, value, helper, tone = "neutral" }: { label: string; value: string; helper: string; tone?: "neutral" | "success" | "danger" }) {
  return (
    <View style={[styles.metric, tone === "success" && styles.metricSuccess, tone === "danger" && styles.metricDanger]}>
      <Text style={[styles.metricLabel, tone === "danger" && styles.metricDangerText]}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

const palette = {
  primary: "#FF3F5F",
  ink: "#111827"
};

const travelImageUrl = "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=900&q=82";

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    padding: 14
  },
  layout: {
    flexDirection: "row",
    gap: 28
  },
  layoutCompact: {
    flexDirection: "column",
    gap: theme.spacing.lg
  },
  image: {
    width: 286,
    minHeight: 320,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#FCE8E8"
  },
  imageCompact: {
    width: "100%",
    minHeight: 230
  },
  imageRadius: {
    borderRadius: 18
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.04)"
  },
  locationChip: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    marginLeft: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    ...theme.shadow
  },
  locationText: {
    color: palette.primary,
    fontWeight: "900",
    fontSize: 13,
    lineHeight: 18
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 18,
    paddingRight: 8
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    flexWrap: "wrap"
  },
  travelers: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    maxWidth: "58%"
  },
  travelersText: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 14
  },
  titleBlock: {
    gap: theme.spacing.sm
  },
  title: {
    color: palette.ink,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20,
    fontSize: 13
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metric: {
    flex: 1,
    minWidth: 148,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FBFAFC",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: 3
  },
  metricSuccess: {
    backgroundColor: "#F4FFF8",
    borderColor: "#BCEFD0"
  },
  metricDanger: {
    backgroundColor: "#FFF4F5",
    borderColor: "#FFC5D0"
  },
  metricLabel: {
    color: theme.colors.muted,
    fontWeight: "900",
    fontSize: theme.typography.small
  },
  metricDangerText: {
    color: palette.primary
  },
  metricValue: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 20,
    lineHeight: 25
  },
  metricHelper: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small
  },
  progressBlock: {
    gap: theme.spacing.sm,
    paddingTop: 2
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  progressLabel: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 13
  }
});

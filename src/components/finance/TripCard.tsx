import { StyleSheet, Text, View } from "react-native";
import { labelStatus } from "../../constants/categories";
import { theme } from "../../constants/theme";
import { actualByTrip, plannedByTrip } from "../../lib/calculations";
import { dateBR, money } from "../../lib/formatters";
import { isSharedTrip, tripDirectionChip, tripTravelerLabel } from "../../lib/productFlow";
import { getEffectiveTripStatus } from "../../lib/tripLifecycle";
import type { Expense, PlannedExpense, Trip } from "../../types/models";
import { AvatarChip } from "../ui/AvatarChip";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { BudgetProgress } from "./BudgetProgress";

export function TripCard({ trip, expenses, plannedExpenses, onPress }: { trip: Trip; expenses: Expense[]; plannedExpenses: PlannedExpense[]; onPress?: () => void }) {
  const actual = actualByTrip(trip.id, expenses);
  const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
  const overBudget = planned > 0 && actual > planned;
  const effectiveStatus = getEffectiveTripStatus(trip);
  const sharedTrip = isSharedTrip(trip);
  return (
    <Card onPress={onPress} accessibilityLabel={`Abrir viagem ${trip.title}`}>
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.subtitle}>{trip.origin_city} → {trip.destination_city}</Text>
        </View>
        <Badge label={labelStatus(effectiveStatus)} tone={effectiveStatus === "concluida" ? "success" : overBudget ? "danger" : "neutral"} />
      </View>
      <View style={styles.row}>
        <AvatarChip person={sharedTrip ? "ambos" : trip.traveler_person} />
        <Badge label={tripDirectionChip(trip)} tone={sharedTrip ? "couple" : trip.traveler_person === "pedro" ? "pedro" : "camilly"} />
        <Text style={styles.date}>{dateBR(trip.start_date)} - {dateBR(trip.end_date)}</Text>
      </View>
      <BudgetProgress planned={planned} actual={actual} />
      <Text style={styles.footer}>Quem viaja: {tripTravelerLabel(trip)} · Planejado {money(planned)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  titleWrap: { flex: 1 },
  title: { color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: "900" },
  subtitle: { color: theme.colors.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md, flexWrap: "wrap" },
  date: { color: theme.colors.text, fontWeight: "800" },
  footer: { color: theme.colors.muted, fontWeight: "700" }
});

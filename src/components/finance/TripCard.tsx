import { Pressable, StyleSheet, Text, View } from "react-native";
import { labelPerson, labelStatus } from "../../constants/categories";
import { theme } from "../../constants/theme";
import { actualByTrip, plannedByTrip } from "../../lib/calculations";
import { dateBR, money } from "../../lib/formatters";
import type { Expense, PlannedExpense, Trip } from "../../types/models";
import { AvatarChip } from "../ui/AvatarChip";
import { Badge } from "../ui/Badge";
import { BudgetProgress } from "./BudgetProgress";

export function TripCard({ trip, expenses, plannedExpenses, onPress }: { trip: Trip; expenses: Expense[]; plannedExpenses: PlannedExpense[]; onPress?: () => void }) {
  const actual = actualByTrip(trip.id, expenses);
  const planned = trip.planned_budget || plannedByTrip(trip.id, plannedExpenses);
  const overBudget = planned > 0 && actual > planned;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.subtitle}>{trip.origin_city} → {trip.destination_city}</Text>
        </View>
        <Badge label={labelStatus(trip.status)} tone={trip.status === "concluida" ? "success" : overBudget ? "danger" : "neutral"} />
      </View>
      <View style={styles.row}>
        <AvatarChip person={trip.traveler_person} />
        <Text style={styles.date}>{dateBR(trip.start_date)} - {dateBR(trip.end_date)}</Text>
      </View>
      <BudgetProgress planned={planned} actual={actual} />
      <Text style={styles.footer}>Viajando: {labelPerson(trip.traveler_person)} · Planejado {money(planned)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: theme.spacing.md,
    ...theme.shadow
  },
  top: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  titleWrap: { flex: 1 },
  title: { color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: "900" },
  subtitle: { color: theme.colors.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md, flexWrap: "wrap" },
  date: { color: theme.colors.text, fontWeight: "800" },
  footer: { color: theme.colors.muted, fontWeight: "700" }
});

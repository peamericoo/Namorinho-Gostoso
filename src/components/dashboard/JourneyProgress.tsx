import { router } from "expo-router";
import { Check, Circle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { plannedByTrip } from "../../lib/calculations";
import type { ChecklistItem, Expense, PlannedExpense, Trip } from "../../types/models";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function JourneyProgress({
  trip,
  expenses,
  plannedExpenses,
  checklistItems,
  settlementAmount
}: {
  trip: Trip;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  checklistItems: ChecklistItem[];
  settlementAmount: number;
}) {
  const tripExpenses = expenses.filter((expense) => expense.trip_id === trip.id);
  const tripChecklist = checklistItems.filter((item) => item.trip_id === trip.id);
  const steps = [
    { label: "Criar viagem", done: true, route: `/trips/${trip.id}` },
    { label: "Planejar custos", done: trip.planned_budget > 0 || plannedByTrip(trip.id, plannedExpenses) > 0, route: "/planned-expenses" },
    { label: "Montar checklist", done: tripChecklist.length > 0, route: "/checklist" },
    { label: "Registrar gastos", done: tripExpenses.length > 0, route: `/expenses/new?tripId=${trip.id}` },
    { label: "Revisar acertos", done: tripExpenses.length > 0 && settlementAmount === 0, route: "/settlements" }
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const progress = doneCount / steps.length;
  const nextStep = steps.find((step) => !step.done) ?? steps[steps.length - 1];

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Acompanhamento</Text>
          <Text style={styles.title}>Jornada da viagem</Text>
          <Text style={styles.meta}>{doneCount} de {steps.length} etapas concluídas.</Text>
        </View>
        <Badge label={`${Math.round(progress * 100)}%`} tone={progress === 1 ? "success" : "couple"} />
      </View>
      <ProgressBar value={progress} tone={progress === 1 ? "success" : "couple"} />
      <View style={styles.steps}>
        {steps.map((step, index) => (
          <Pressable
            key={step.label}
            accessibilityRole="button"
            accessibilityLabel={step.label}
            onPress={() => router.push(step.route as never)}
            style={({ pressed }) => [styles.step, step.done && styles.stepDone, pressed && styles.stepPressed]}
          >
            <View style={[styles.iconWrap, step.done && styles.iconWrapDone]}>
              {step.done ? <Check size={15} color={theme.colors.successStrong} /> : <Circle size={13} color={theme.colors.coupleStrong} />}
            </View>
            <View style={styles.stepCopy}>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
              <Text style={styles.stepMeta}>{step.done ? "Concluído" : `Etapa ${index + 1}`}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Button title={nextStep.done ? "Ver acertos" : nextStep.label} variant={nextStep.done ? "secondary" : "primary"} onPress={() => router.push(nextStep.route as never)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  copy: {
    flex: 1
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
    fontSize: theme.typography.h2,
    fontWeight: "900"
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 3
  },
  steps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  step: {
    flex: 1,
    minWidth: 132,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm
  },
  stepDone: {
    backgroundColor: theme.colors.success,
    borderColor: "#BBF7D0"
  },
  stepPressed: {
    opacity: 0.8
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  iconWrapDone: {
    borderColor: "#BBF7D0"
  },
  stepCopy: {
    flex: 1
  },
  stepLabel: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 13
  },
  stepLabelDone: {
    color: theme.colors.successStrong
  },
  stepMeta: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small
  }
});

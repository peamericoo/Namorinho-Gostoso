import { router } from "expo-router";
import { Check, ClipboardList, Lightbulb, Pencil, Scale, WalletCards, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { plannedByTrip } from "../../lib/calculations";
import type { ChecklistItem, Expense, PlannedExpense, Trip } from "../../types/models";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type JourneyProgressProps = {
  trip: Trip;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  checklistItems: ChecklistItem[];
  settlementAmount: number;
  style?: StyleProp<ViewStyle>;
};

type JourneyStep = {
  label: string;
  done: boolean;
  progressDone?: boolean;
  route: string;
  Icon: LucideIcon;
};

export function JourneyProgress({ trip, expenses, plannedExpenses, checklistItems, settlementAmount, style }: JourneyProgressProps) {
  const activePulse = useRef(new Animated.Value(0)).current;
  const tripExpenses = expenses.filter((expense) => expense.trip_id === trip.id);
  const tripChecklist = checklistItems.filter((item) => item.trip_id === trip.id);
  const steps: JourneyStep[] = [
    { label: "Criar viagem", done: true, route: `/trips/${trip.id}`, Icon: Check },
    { label: "Planejar custos", done: trip.planned_budget > 0 || plannedByTrip(trip.id, plannedExpenses) > 0, route: "/planned-expenses", Icon: Pencil },
    { label: "Montar checklist", done: tripChecklist.length > 0, route: "/checklist", Icon: ClipboardList },
    { label: "Registrar gastos", done: tripExpenses.length > 0, route: `/expenses/new?tripId=${trip.id}`, Icon: WalletCards },
    { label: "Revisar acertos", done: false, progressDone: tripExpenses.length > 0 && settlementAmount === 0, route: "/settlements", Icon: Scale }
  ];
  const doneCount = steps.filter((step) => step.done || step.progressDone).length;
  const progress = doneCount / steps.length;
  const nextStepIndex = steps.findIndex((step) => !step.done);
  const activeIndex = nextStepIndex === -1 ? steps.length - 1 : nextStepIndex;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(activePulse, {
          toValue: 1,
          duration: 1050,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        }),
        Animated.timing(activePulse, {
          toValue: 0,
          duration: 1050,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [activePulse]);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>Jornada da viagem</Text>
          <Text style={styles.meta}>
            {doneCount} de {steps.length} etapas concluídas
          </Text>
        </View>
        <Badge label={`${Math.round(progress * 100)}%`} tone={progress === 1 ? "success" : "couple"} />
      </View>

      <View style={styles.timeline}>
        <View style={styles.connector} />
        {steps.map((step, index) => {
          const state = step.done ? "done" : index === activeIndex ? "active" : "pending";
          const Icon = step.done ? Check : step.Icon;
          return (
            <Pressable
              key={step.label}
              accessibilityRole="button"
              accessibilityLabel={step.label}
              onPress={() => router.push(step.route as never)}
              style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
            >
              <Animated.View
                style={[
                  styles.node,
                  state === "done" && styles.nodeDone,
                  state === "active" && styles.nodeActive,
                  state === "active" && {
                    transform: [{ scale: activePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }]
                  }
                ]}
              >
                <Icon color={state === "done" ? palette.success : state === "active" ? palette.primary : palette.muted} size={24} strokeWidth={state === "pending" ? 2 : 2.6} />
              </Animated.View>
              <Text style={[styles.stepLabel, state === "active" && styles.stepLabelActive]} numberOfLines={2}>
                {step.label}
              </Text>
              <Text style={styles.stepMeta}>{step.done ? "Concluído" : step.label === "Revisar acertos" ? "Pendente" : `Etapa ${index + 1}`}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tip}>
        <View style={styles.tipIcon}>
          <Lightbulb color={palette.warning} size={22} strokeWidth={2.5} />
        </View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>Dica</Text>
          <Text style={styles.tipText}>{tipForStep(steps[activeIndex])}</Text>
        </View>
      </View>
    </Card>
  );
}

function tipForStep(step: JourneyStep) {
  if (step.label === "Planejar custos") return "Planeje seus custos para ter uma visão clara do orçamento da viagem.";
  if (step.label === "Montar checklist") return "Monte a checklist enquanto a viagem ainda está longe para evitar compras de última hora.";
  if (step.label === "Registrar gastos") return "Registre cada gasto assim que acontecer para manter o resumo financeiro confiável.";
  if (step.label === "Revisar acertos") return "Revise os acertos quando todos os gastos já estiverem lançados.";
  return "Tudo encaminhado. Abra os detalhes da viagem para revisar os próximos passos.";
}

const palette = {
  primary: "#FF3F5F",
  primarySoft: "#FFF0F3",
  success: "#25A46A",
  successSoft: "#E8FBF0",
  warning: "#A96D17",
  muted: "#64748B",
  ink: "#111827"
};

const styles = StyleSheet.create({
  card: {
    minHeight: 286
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md
  },
  copy: {
    flex: 1
  },
  title: {
    color: palette.ink,
    fontSize: theme.typography.h2,
    lineHeight: 24,
    fontWeight: "900"
  },
  meta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 3
  },
  timeline: {
    width: "100%",
    height: 142,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
    paddingTop: 14,
    paddingHorizontal: 2
  },
  connector: {
    position: "absolute",
    top: 43,
    left: "9%",
    right: "9%",
    height: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.line
  },
  step: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4
  },
  stepPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }]
  },
  node: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.line,
    zIndex: 1
  },
  nodeDone: {
    backgroundColor: palette.successSoft,
    borderColor: "#A9E8C2"
  },
  nodeActive: {
    backgroundColor: palette.primarySoft,
    borderColor: "#FF8CA1"
  },
  stepLabel: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    minHeight: 36
  },
  stepLabelActive: {
    color: palette.ink
  },
  stepMeta: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small,
    textAlign: "center"
  },
  tip: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2DEC8",
    backgroundColor: "#FFFBF6",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  tipIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  tipCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flexWrap: "wrap"
  },
  tipTitle: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 14
  },
  tipText: {
    flex: 1,
    minWidth: 220,
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 19,
    fontSize: 13
  }
});

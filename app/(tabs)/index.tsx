import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { DashboardFinancialSummary } from "../../src/components/dashboard/DashboardFinancialSummary";
import { DashboardNextStepCard, type DashboardNextAction } from "../../src/components/dashboard/DashboardNextStepCard";
import { JourneyProgress } from "../../src/components/dashboard/JourneyProgress";
import { TripSelector } from "../../src/components/dashboard/TripSelector";
import { TripSummaryCard } from "../../src/components/dashboard/TripSummaryCard";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { useDashboard } from "../../src/hooks/useDashboard";
import { useWorkspace } from "../../src/hooks/useWorkspace";
import { calculateSettlement, plannedByTrip } from "../../src/lib/calculations";
import type { Expense, PlannedExpense, Settlement, Trip } from "../../src/types/models";

const DASHBOARD_MAX_WIDTH = 1360;
const TOP_CARD_HEIGHT = 348;

export default function DashboardScreen() {
  const workspace = useWorkspace();
  const dashboard = useDashboard();
  const data = dashboard.data;
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const [selectedTripId, setSelectedTripId] = useState("");

  const defaultTripId = data.upcomingTrip?.id ?? data.lastCompletedTrip?.id ?? data.trips[0]?.id ?? "";

  useEffect(() => {
    if (!data.trips.length) {
      setSelectedTripId("");
      return;
    }
    if (!selectedTripId || !data.trips.some((trip) => trip.id === selectedTripId)) {
      setSelectedTripId(defaultTripId);
    }
  }, [data.trips, defaultTripId, selectedTripId]);

  const selectedTrip = useMemo(() => data.trips.find((trip) => trip.id === selectedTripId) ?? data.trips.find((trip) => trip.id === defaultTripId) ?? null, [data.trips, defaultTripId, selectedTripId]);
  const selectedExpenses = useMemo(() => filterByTrip(data.expenses, selectedTrip), [data.expenses, selectedTrip]);
  const selectedPlanned = useMemo(() => filterByTrip(data.plannedExpenses, selectedTrip), [data.plannedExpenses, selectedTrip]);
  const selectedSettlements = useMemo(() => filterSettlementsByTrip(data.settlements, selectedTrip), [data.settlements, selectedTrip]);
  const selectedSettlement = useMemo(() => calculateSettlement(selectedExpenses, selectedSettlements), [selectedExpenses, selectedSettlements]);
  const nextAction = useMemo(() => (selectedTrip ? nextActionFor(selectedTrip, selectedExpenses, selectedPlanned, selectedSettlement.amount) : null), [selectedExpenses, selectedPlanned, selectedSettlement.amount, selectedTrip]);
  const displayName = workspace.data?.profile?.display_name ?? "vocês";
  const coupleName = workspace.data?.couple?.name ?? "Nosso Lugar";

  return (
    <Screen maxWidth={DASHBOARD_MAX_WIDTH} contentStyle={styles.screenContent}>
      <DashboardOrnaments />

      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={220} />
          <Skeleton height={220} />
        </>
      ) : !data.trips.length ? (
        <EmptyState
          title="Nenhuma viagem planejada"
          message="Crie a primeira viagem para acompanhar orçamento, checklist, gastos e acertos em um painel organizado."
          actionLabel="Criar viagem"
          onAction={() => router.push("/trips/new")}
        />
      ) : selectedTrip ? (
        <>
          <AnimatedSection style={[styles.welcomeBar, isWide && styles.welcomeBarWide]}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>Olá, {displayName}! 👋</Text>
              <Text style={styles.welcomeSubtitle}>Bem-vindo ao painel de viagens do {coupleName}.</Text>
            </View>
            <TripSelector trips={data.trips} selectedTripId={selectedTrip.id} onChange={setSelectedTripId} style={isWide ? styles.selectorWide : undefined} />
          </AnimatedSection>

          <AnimatedSection delay={70} style={[styles.heroGrid, isWide && styles.heroGridWide]}>
            <TripSummaryCard trip={selectedTrip} expenses={selectedExpenses} plannedExpenses={selectedPlanned} onOpenTrip={() => router.push(`/trips/${selectedTrip.id}`)} style={isWide ? styles.tripCardWide : undefined} />
            {nextAction ? <DashboardNextStepCard action={nextAction} style={isWide ? styles.nextCardWide : undefined} /> : null}
          </AnimatedSection>

          <AnimatedSection delay={140} style={[styles.detailGrid, isWide && styles.detailGridWide]}>
            <JourneyProgress
              trip={selectedTrip}
              expenses={selectedExpenses}
              plannedExpenses={selectedPlanned}
              checklistItems={data.checklistItems}
              settlementAmount={selectedSettlement.amount}
              style={isWide ? styles.journeyWide : undefined}
            />
            <DashboardFinancialSummary trip={selectedTrip} expenses={selectedExpenses} plannedExpenses={selectedPlanned} settlements={selectedSettlements} style={isWide ? styles.financeWide : undefined} />
          </AnimatedSection>
        </>
      ) : null}
    </Screen>
  );
}

function filterByTrip<T extends { trip_id?: string | null }>(rows: T[], trip: Trip | null) {
  if (!trip) return [];
  return rows.filter((row) => row.trip_id === trip.id);
}

function filterSettlementsByTrip(settlements: Settlement[], trip: Trip | null) {
  if (!trip) return [];
  return settlements.filter((settlement) => settlement.trip_id === trip.id);
}

function nextActionFor(trip: Trip, expenses: Expense[], plannedExpenses: PlannedExpense[], settlementAmount: number): DashboardNextAction {
  if (trip.planned_budget === 0 && plannedByTrip(trip.id, plannedExpenses) === 0) {
    return {
      eyebrow: "Próxima etapa",
      title: "Adicionar custos planejados",
      message: "Inclua transporte, hospedagem e gastos prováveis para entender o limite da viagem.",
      action: "Adicionar custos",
      route: "/planned-expenses"
    };
  }
  if (expenses.length === 0) {
    return {
      eyebrow: "Acompanhamento",
      title: "Registrar o primeiro gasto",
      message: "Com gastos reais, o painel calcula diferença, divisão e acerto estimado.",
      action: "Novo gasto",
      route: `/expenses/new?tripId=${trip.id}`
    };
  }
  if (settlementAmount > 0) {
    return {
      eyebrow: "Acertos",
      title: "Revisar divisão atual",
      message: "Existe diferença entre quem pagou e a responsabilidade de cada um.",
      action: "Ver acertos",
      route: "/settlements"
    };
  }
  return {
    eyebrow: "Tudo encaminhado",
    title: "Abrir detalhes da viagem",
    message: "Veja roteiro, checklist, links e custos planejados em um só lugar.",
    action: "Abrir viagem",
    route: `/trips/${trip.id}`
  };
}

function DashboardOrnaments() {
  return (
    <View style={styles.ornaments}>
      <View style={styles.topBlob} />
      <View style={styles.leftPin}>
        <View style={styles.pinHead} />
        <View style={styles.pinTail} />
      </View>
      <View style={styles.leaves}>
        <View style={[styles.leaf, styles.leafOne]} />
        <View style={[styles.leaf, styles.leafTwo]} />
        <View style={[styles.leaf, styles.leafThree]} />
        <View style={[styles.leaf, styles.leafFour]} />
      </View>
    </View>
  );
}

function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay,
        useNativeDriver: false
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        speed: 18,
        bounciness: 5,
        useNativeDriver: false
      })
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const palette = {
  primary: "#FF3F5F",
  ink: "#111827"
};

const styles = StyleSheet.create({
  screenContent: {
    position: "relative",
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 22
  },
  welcomeBar: {
    gap: theme.spacing.lg
  },
  welcomeBarWide: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  welcomeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5
  },
  welcomeTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900"
  },
  welcomeSubtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700"
  },
  selectorWide: {
    flexShrink: 0
  },
  heroGrid: {
    gap: 22
  },
  heroGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%"
  },
  tripCardWide: {
    flex: 1,
    minWidth: 0,
    height: TOP_CARD_HEIGHT
  },
  nextCardWide: {
    width: 380,
    flexShrink: 0,
    height: TOP_CARD_HEIGHT
  },
  detailGrid: {
    gap: 22
  },
  detailGridWide: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  journeyWide: {
    flex: 1.05,
    minWidth: 0
  },
  financeWide: {
    flex: 0.95,
    minWidth: 0
  },
  ornaments: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    pointerEvents: "none"
  },
  topBlob: {
    position: "absolute",
    top: -70,
    right: -130,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#FFE6EB",
    opacity: 0.62
  },
  leftPin: {
    position: "absolute",
    left: -74,
    bottom: 128,
    width: 120,
    height: 80,
    opacity: 0.52
  },
  pinHead: {
    position: "absolute",
    left: 35,
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 9,
    borderColor: palette.primary,
    backgroundColor: theme.colors.surface
  },
  pinTail: {
    position: "absolute",
    left: 8,
    top: 54,
    width: 94,
    height: 22,
    borderBottomWidth: 2,
    borderColor: "#FFB7C2",
    borderStyle: "dashed",
    borderRadius: 50,
    transform: [{ rotate: "-8deg" }]
  },
  leaves: {
    position: "absolute",
    right: -22,
    bottom: -18,
    width: 118,
    height: 150,
    opacity: 0.5
  },
  leaf: {
    position: "absolute",
    width: 25,
    height: 70,
    borderRadius: 28,
    backgroundColor: "#B8796F"
  },
  leafOne: {
    left: 42,
    bottom: 0,
    transform: [{ rotate: "-31deg" }]
  },
  leafTwo: {
    left: 66,
    bottom: 24,
    transform: [{ rotate: "22deg" }]
  },
  leafThree: {
    left: 18,
    bottom: 34,
    transform: [{ rotate: "-48deg" }]
  },
  leafFour: {
    left: 82,
    bottom: 64,
    transform: [{ rotate: "36deg" }]
  }
});

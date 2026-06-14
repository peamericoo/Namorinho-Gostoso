import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { JourneyProgress } from "../../src/components/dashboard/JourneyProgress";
import { TripSelector } from "../../src/components/dashboard/TripSelector";
import { TripSummaryCard } from "../../src/components/dashboard/TripSummaryCard";
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { NotificationsSheet, type NotificationItem } from "../../src/components/notifications/NotificationsSheet";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { useDashboard } from "../../src/hooks/useDashboard";
import { useWorkspace } from "../../src/hooks/useWorkspace";
import { calculateSettlement, plannedByTrip, tripSummary } from "../../src/lib/calculations";
import { money } from "../../src/lib/formatters";
import type { Expense, PlannedExpense, Settlement, Trip } from "../../src/types/models";

export default function DashboardScreen() {
  const workspace = useWorkspace();
  const dashboard = useDashboard();
  const data = dashboard.data;
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const [selectedTripId, setSelectedTripId] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
  const notifications = useMemo(() => (selectedTrip ? selectedTripNotifications(selectedTrip, selectedExpenses, selectedPlanned, data.alerts, selectedSettlement.amount) : []), [data.alerts, selectedExpenses, selectedPlanned, selectedSettlement.amount, selectedTrip]);
  const notificationCount = notifications.filter((notification) => notification.tone !== "success").length;

  return (
    <Screen>
      <Header
        title={`Oi, ${workspace.data?.profile?.display_name ?? "vocês"}`}
        subtitle={`${workspace.data?.couple?.name ?? "Espaço do casal"} · painel por viagem.`}
        right={
          <View style={styles.headerActions}>
            <NotificationBell count={notificationCount} onPress={() => setNotificationsOpen(true)} />
            <Button
              title={selectedTrip ? "Novo gasto" : "Planejar viagem"}
              onPress={() => router.push(selectedTrip ? (`/expenses/new?tripId=${selectedTrip.id}` as never) : "/trips/new")}
            />
          </View>
        }
      />
      <NotificationsSheet visible={notificationsOpen} notifications={notifications} onClose={() => setNotificationsOpen(false)} />

      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={180} />
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
          <TripSelector trips={data.trips} selectedTripId={selectedTrip.id} onChange={setSelectedTripId} />

          <TripSummaryCard
            trip={selectedTrip}
            expenses={selectedExpenses}
            plannedExpenses={selectedPlanned}
            onOpenTrip={() => router.push(`/trips/${selectedTrip.id}`)}
          />
          {nextAction ? <NextActionCard action={nextAction} /> : null}

          <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
            <JourneyProgress
              trip={selectedTrip}
              expenses={selectedExpenses}
              plannedExpenses={selectedPlanned}
              checklistItems={data.checklistItems}
              settlementAmount={selectedSettlement.amount}
            />
            <FinancialOverview trip={selectedTrip} expenses={selectedExpenses} plannedExpenses={selectedPlanned} settlements={selectedSettlements} />
          </View>
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

function nextActionFor(trip: Trip, expenses: Expense[], plannedExpenses: PlannedExpense[], settlementAmount: number) {
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

function selectedTripNotifications(
  trip: Trip,
  expenses: Expense[],
  plannedExpenses: PlannedExpense[],
  globalAlerts: { message: string; tone: "warning" | "danger" | "success" }[],
  settlementAmount: number
) {
  const summary = tripSummary(trip, expenses, plannedExpenses);
  const notifications: NotificationItem[] = [];
  if (summary.difference < 0) {
    notifications.push({
      id: `${trip.id}-budget`,
      title: "Atenção ao orçamento",
      tone: "danger",
      message: `Esta viagem está ${money(Math.abs(summary.difference))} acima do orçamento planejado.`,
      actionLabel: "Ver gastos",
      route: "/(tabs)/expenses"
    });
  }

  globalAlerts
    .filter((alert) => alert.message.includes(trip.title))
    .slice(0, 2)
    .forEach((alert, index) => {
      notifications.push({
        id: `${trip.id}-global-${index}`,
        title: alert.tone === "danger" ? "Atenção ao orçamento" : "Ponto de atenção",
        message: alert.message,
        tone: alert.tone,
        actionLabel: "Abrir viagem",
        route: `/trips/${trip.id}`
      });
    });

  if (settlementAmount > 0) {
    notifications.push({
      id: `${trip.id}-settlement`,
      title: "Acerto pendente",
      tone: "warning",
      message: "Existe valor pendente de acerto entre Pedro e Camilly nesta seleção.",
      actionLabel: "Simular acerto",
      route: "/settlements"
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: `${trip.id}-ok`,
      title: "Tudo certo",
      tone: "success",
      message: "Nenhuma notificação importante para esta viagem agora."
    });
  }
  return notifications.slice(0, 4);
}

function NextActionCard({ action }: { action: { eyebrow: string; title: string; message: string; action: string; route: string } }) {
  return (
    <Card style={styles.nextActionCard}>
      <View style={styles.nextActionCopy}>
        <Text style={styles.eyebrow}>{action.eyebrow}</Text>
        <Text style={styles.cardTitle}>{action.title}</Text>
        <Text style={styles.muted}>{action.message}</Text>
      </View>
      <Button title={action.action} onPress={() => router.push(action.route as never)} />
    </Card>
  );
}

function FinancialOverview({ trip, expenses, plannedExpenses, settlements }: { trip: Trip; expenses: Expense[]; plannedExpenses: PlannedExpense[]; settlements: Settlement[] }) {
  const settlement = calculateSettlement(expenses, settlements);
  const summary = tripSummary(trip, expenses, plannedExpenses);
  return (
    <Card>
      <View style={styles.cardHeaderRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Resumo financeiro</Text>
          <Text style={styles.cardTitle}>Divisão e orçamento</Text>
        </View>
        <Badge label={summary.difference < 0 ? "Acima" : "Dentro"} tone={summary.difference < 0 ? "danger" : "success"} />
      </View>
      <View style={styles.metricGrid}>
        <MiniMetric label="Planejado" value={money(summary.planned)} />
        <MiniMetric label="Realizado" value={money(summary.actual)} />
        <MiniMetric label="Diferença" value={money(summary.difference)} tone={summary.difference < 0 ? "danger" : "success"} />
        <MiniMetric label="Pedro pagou" value={money(settlement.totalPaidByPedro)} tone="pedro" />
        <MiniMetric label="Camilly pagou" value={money(settlement.totalPaidByCamilly)} tone="camilly" />
        <MiniMetric label="Acerto" value={money(settlement.amount)} tone={settlement.amount > 0 ? "warning" : "success"} />
      </View>
      <Text style={styles.muted}>{settlement.message}</Text>
    </Card>
  );
}

function MiniMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "success" | "warning" | "danger" | "pedro" | "camilly" }) {
  return (
    <View style={[styles.miniMetric, tone !== "neutral" && styles[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: theme.spacing.sm },
  nextActionCard: { minHeight: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nextActionCopy: { flex: 1, gap: theme.spacing.xs },
  contentGrid: { gap: theme.spacing.md },
  contentGridWide: { flexDirection: "row", alignItems: "stretch" },
  cardHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.spacing.md },
  titleWrap: { flex: 1 },
  eyebrow: { color: theme.colors.coupleStrong, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6, fontSize: 12 },
  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  muted: { color: theme.colors.muted, fontWeight: "700", lineHeight: 21 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  miniMetric: {
    flex: 1,
    minWidth: 112,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    padding: theme.spacing.sm,
    gap: 2
  },
  success: { backgroundColor: theme.colors.success },
  warning: { backgroundColor: theme.colors.warning },
  danger: { backgroundColor: theme.colors.danger },
  pedro: { backgroundColor: theme.colors.pedro },
  camilly: { backgroundColor: theme.colors.camilly },
  metricLabel: { color: theme.colors.muted, fontWeight: "900", fontSize: theme.typography.small },
  metricValue: { color: theme.colors.text, fontWeight: "900", fontSize: 16 }
});

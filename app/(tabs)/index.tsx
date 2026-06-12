import { router } from "expo-router";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { PlannedVsActualChart } from "../../src/components/charts/PlannedVsActualChart";
import { SpendingByCategoryChart } from "../../src/components/charts/SpendingByCategoryChart";
import { MonthlyEvolutionChart } from "../../src/components/charts/MonthlyEvolutionChart";
import { PersonSplitChart } from "../../src/components/charts/PersonSplitChart";
import { SettlementCard } from "../../src/components/finance/SettlementCard";
import { TripCard } from "../../src/components/finance/TripCard";
import { AlertBanner } from "../../src/components/ui/AlertBanner";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { labelPerson } from "../../src/constants/categories";
import { theme } from "../../src/constants/theme";
import { useDashboard } from "../../src/hooks/useDashboard";
import { useWorkspace } from "../../src/hooks/useWorkspace";
import { dateBR, money, percent } from "../../src/lib/formatters";
import { daysUntilTrip, hasChecklistForTrip, hasPlannedCosts, tripBudgetProgress, tripChecklistProgress, tripDirectionChip } from "../../src/lib/productFlow";

export default function DashboardScreen() {
  const workspace = useWorkspace();
  const dashboard = useDashboard();
  const data = dashboard.data;
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAnalyses, setShowAnalyses] = useState(false);

  const nextAction = useMemo(() => {
    if (!data.trips.length) {
      return {
        eyebrow: "Comece pelo principal",
        title: "Criar o primeiro encontro",
        message: "Defina datas, cidades e quem viaja para o planejamento ganhar forma.",
        action: "Criar viagem",
        route: "/trips/new"
      };
    }
    if (data.upcomingTrip && !hasPlannedCosts(data.upcomingTrip, data.plannedExpenses)) {
      return {
        eyebrow: "Próxima etapa",
        title: "Adicionar custos planejados",
        message: "Inclua transporte, estadia e gastos prováveis para saber se o plano cabe no orçamento.",
        action: "Adicionar custos",
        route: "/planned-expenses"
      };
    }
    if (data.upcomingTrip && !hasChecklistForTrip(data.upcomingTrip, data.checklistItems)) {
      return {
        eyebrow: "Organização",
        title: "Criar checklist da viagem",
        message: "Liste documentos, reservas e combinados para nada ficar solto perto da data.",
        action: "Abrir checklist",
        route: "/checklist"
      };
    }
    if (!data.expenses.length) {
      return {
        eyebrow: "Acompanhamento",
        title: "Registrar o primeiro gasto",
        message: "A partir dos gastos reais, o app calcula diferença, divisão e acertos.",
        action: "Novo gasto",
        route: "/expenses/new"
      };
    }
    if (data.settlement.amount > 0) {
      return {
        eyebrow: "Acertos",
        title: "Revisar divisão atual",
        message: data.settlement.message,
        action: "Ver acertos",
        route: "/settlements"
      };
    }
    return {
      eyebrow: "Próximo passo",
      title: "Simular o próximo encontro",
      message: "Teste cenários futuros sem mexer no planejamento que já está salvo.",
      action: "Simular viagem",
      route: "/(tabs)/simulator"
    };
  }, [data.checklistItems, data.expenses.length, data.plannedExpenses, data.settlement.amount, data.settlement.message, data.trips.length, data.upcomingTrip]);

  const onboardingSteps = [
    { label: "Criar primeira viagem", done: data.trips.length > 0, route: "/trips/new" },
    { label: "Planejar custos", done: Boolean(data.upcomingTrip && hasPlannedCosts(data.upcomingTrip, data.plannedExpenses)), route: "/planned-expenses" },
    { label: "Montar checklist", done: Boolean(data.upcomingTrip && hasChecklistForTrip(data.upcomingTrip, data.checklistItems)), route: "/checklist" },
    { label: "Registrar gastos", done: data.expenses.length > 0, route: "/expenses/new" },
    { label: "Revisar acertos", done: data.expenses.length > 0 && data.settlement.amount === 0, route: "/settlements" },
    { label: "Compartilhar código", done: Boolean(workspace.data?.couple?.invite_code), route: "/settings" }
  ];
  const setupProgress = onboardingSteps.filter((step) => step.done).length / onboardingSteps.length;

  return (
    <Screen>
      <Header title={`Oi, ${workspace.data?.profile?.display_name ?? "vocês"}`} subtitle={`${workspace.data?.couple?.name ?? "Espaço do casal"} · painel de próximos encontros.`} />
      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={180} />
        </>
      ) : (
        <>
          <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
            <StatusCard data={data} isWide={isWide} />
            <View style={styles.sideColumn}>
              <NextActionCard nextAction={nextAction} />
              <InviteCard code={workspace.data?.couple?.invite_code} />
            </View>
          </View>

          <GettingStartedCard steps={onboardingSteps} progress={setupProgress} />

          <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
            <FinanceSummaryCard data={data} />
            <SettlementCard expenses={data.expenses} settlements={data.settlements} />
          </View>

          <View style={styles.actions}>
            <Button title="Nova viagem" onPress={() => router.push("/trips/new")} style={styles.actionButton} />
            <Button title="Novo gasto" variant="secondary" onPress={() => router.push("/expenses/new")} style={styles.actionButton} />
            <Button title="Simular" variant="secondary" onPress={() => router.push("/(tabs)/simulator")} style={styles.actionButton} />
            <Button title="Acertos" variant="secondary" onPress={() => router.push("/settlements")} style={styles.actionButton} />
          </View>

          <SmartAlertsPanel alerts={data.alerts} expanded={showAlerts} onToggle={() => setShowAlerts((value) => !value)} />

          {data.upcomingTrip ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Próximo encontro</Text>
              <TripCard trip={data.upcomingTrip} expenses={data.expenses} plannedExpenses={data.plannedExpenses} onPress={() => router.push(`/trips/${data.upcomingTrip?.id}`)} />
            </View>
          ) : null}

          <CollapsibleSection title="Análises" subtitle="Gráficos e evolução ficam aqui quando vocês quiserem aprofundar." expanded={showAnalyses} onToggle={() => setShowAnalyses((value) => !value)}>
            <View style={[styles.chartGrid, isWide && styles.chartGridWide]}>
              <SpendingByCategoryChart expenses={data.expenses} categories={data.categories} />
              <PlannedVsActualChart planned={data.totalPlanned} actual={data.totalSpent} />
              <PersonSplitChart expenses={data.expenses} settlements={data.settlements} />
              <MonthlyEvolutionChart expenses={data.expenses} />
            </View>
            <Card>
              <Text style={styles.cardTitle}>Economia acumulada</Text>
              <Text style={styles.big}>{money(data.savings.saved)}</Text>
              <Text style={styles.muted}>Faltam {money(data.savings.remaining)} para as metas cadastradas.</Text>
            </Card>
          </CollapsibleSection>
        </>
      )}
    </Screen>
  );
}

function StatusCard({ data, isWide }: { data: ReturnType<typeof useDashboard>["data"]; isWide: boolean }) {
  const trip = data.upcomingTrip;
  const days = daysUntilTrip(trip);
  const budget = trip ? tripBudgetProgress(trip, data.expenses, data.plannedExpenses) : 0;
  const checklist = trip ? tripChecklistProgress(trip, data.checklistItems) : 0;
  const savings = Math.min(data.savings.progress, 1);
  const title = trip ? `${labelPerson(trip.traveler_person)} em ${trip.destination_city}` : "Próxima viagem ainda não definida";
  const subtitle = trip ? `${dateBR(trip.start_date)} · ${tripDirectionChip(trip)}` : "Comecem criando ou simulando o próximo encontro.";

  return (
    <Card style={[styles.statusCard, isWide && styles.statusCardWide]}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Estado do plano</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.mutedStrong}>{subtitle}</Text>
        </View>
        {trip ? <Badge label={days === null ? "Sem data" : days > 0 ? `Faltam ${days} dias` : days === 0 ? "Hoje" : "Em andamento"} tone={days !== null && days <= 7 ? "warning" : "success"} /> : null}
      </View>
      <View style={styles.progressGroup}>
        <ProgressMetric label="Orçamento usado" value={budget} text={trip ? percent(Math.min(budget, 1) * 100) : "0%"} tone={budget > 1 ? "danger" : budget > 0.8 ? "warning" : "couple"} />
        <ProgressMetric label="Checklist" value={checklist} text={trip ? percent(checklist * 100) : "0%"} tone={checklist === 1 ? "success" : "couple"} />
        <ProgressMetric label="Economia" value={savings} text={percent(savings * 100)} tone={savings >= 1 ? "success" : "couple"} />
      </View>
      <Button title={trip ? "Continuar planejamento" : "Planejar próxima viagem"} onPress={() => router.push(trip ? `/trips/${trip.id}` : "/trips/new")} />
    </Card>
  );
}

function NextActionCard({ nextAction }: { nextAction: { eyebrow: string; title: string; message: string; action: string; route: string } }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>{nextAction.eyebrow}</Text>
      <Text style={styles.cardTitle}>{nextAction.title}</Text>
      <Text style={styles.muted}>{nextAction.message}</Text>
      <Button title={nextAction.action} onPress={() => router.push(nextAction.route as never)} />
    </Card>
  );
}

function InviteCard({ code }: { code?: string | null }) {
  return (
    <Card style={styles.compactCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.smallTitle}>Convite do espaço</Text>
          <Text style={styles.muted}>Use esse código para a outra conta entrar no mesmo espaço.</Text>
        </View>
        {code ? <Badge label={code} tone="pedro" /> : <Badge label="Sem código" tone="warning" />}
      </View>
      <Button title="Configurações" variant="secondary" size="sm" onPress={() => router.push("/settings")} />
    </Card>
  );
}

function GettingStartedCard({ steps, progress }: { steps: { label: string; done: boolean; route: string }[]; progress: number }) {
  return (
    <Card>
      <View style={styles.cardHeaderRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>Comece por aqui</Text>
          <Text style={styles.cardTitle}>Jornada da primeira viagem</Text>
        </View>
        <Badge label={percent(progress * 100)} tone={progress === 1 ? "success" : "neutral"} />
      </View>
      <ProgressBar value={progress} tone={progress === 1 ? "success" : "couple"} />
      <View style={styles.stepGrid}>
        {steps.map((step, index) => (
          <Pressable key={step.label} accessibilityRole="button" onPress={() => router.push(step.route as never)} style={[styles.stepPill, step.done && styles.stepDone]}>
            <Text style={[styles.stepNumber, step.done && styles.stepNumberDone]}>{step.done ? "✓" : index + 1}</Text>
            <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function FinanceSummaryCard({ data }: { data: ReturnType<typeof useDashboard>["data"] }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Resumo financeiro</Text>
      <View style={styles.metricGrid}>
        <MiniMetric label="Planejado" value={money(data.totalPlanned)} />
        <MiniMetric label="Realizado" value={money(data.totalSpent)} />
        <MiniMetric label="Diferença" value={money(data.plannedVsActual)} tone={data.plannedVsActual >= 0 ? "success" : "warning"} />
      </View>
      <Text style={styles.mutedStrong}>Divisão atual: {data.settlement.message}</Text>
    </Card>
  );
}

function SmartAlertsPanel({ alerts, expanded, onToggle }: { alerts: { message: string; tone: "warning" | "danger" | "success" }[]; expanded: boolean; onToggle: () => void }) {
  const [primary, ...rest] = alerts;
  if (!primary) return null;

  return (
    <View style={styles.section}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.sectionTitle}>Alertas inteligentes</Text>
        <Pressable accessibilityRole="button" onPress={onToggle} style={styles.inlineButton}>
          <Text style={styles.inlineButtonText}>{rest.length ? `${alerts.length} pontos` : "1 ponto"}</Text>
          {expanded ? <ChevronUp size={18} color={theme.colors.coupleStrong} /> : <ChevronDown size={18} color={theme.colors.coupleStrong} />}
        </Pressable>
      </View>
      <AlertBanner message={primary.message} tone={primary.tone} />
      {expanded ? rest.map((alert) => <AlertBanner key={alert.message} message={alert.message} tone={alert.tone} />) : null}
    </View>
  );
}

function CollapsibleSection({ title, subtitle, expanded, onToggle, children }: { title: string; subtitle: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.collapsibleHeader}>
        <View style={styles.titleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.muted}>{subtitle}</Text>
        </View>
        {expanded ? <ChevronUp size={22} color={theme.colors.coupleStrong} /> : <ChevronDown size={22} color={theme.colors.coupleStrong} />}
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

function ProgressMetric({ label, value, text, tone }: { label: string; value: number; text: string; tone: "couple" | "success" | "warning" | "danger" }) {
  return (
    <View style={styles.progressMetric}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{text}</Text>
      </View>
      <ProgressBar value={Math.min(value, 1)} tone={tone} />
    </View>
  );
}

function MiniMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "success" | "warning" }) {
  return (
    <View style={[styles.miniMetric, tone === "success" && styles.miniMetricSuccess, tone === "warning" && styles.miniMetricWarning]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.miniMetricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroGrid: { gap: theme.spacing.md },
  heroGridWide: { flexDirection: "row", alignItems: "stretch" },
  statusCard: { backgroundColor: theme.colors.surfaceRaised },
  statusCardWide: { flex: 1.45 },
  sideColumn: { flex: 1, gap: theme.spacing.md },
  contentGrid: { gap: theme.spacing.md },
  contentGridWide: { flexDirection: "row", alignItems: "stretch" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  actionButton: { flexGrow: 1 },
  section: { gap: theme.spacing.md },
  cardHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.spacing.md },
  titleWrap: { flex: 1 },
  eyebrow: { color: theme.colors.coupleStrong, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8, fontSize: 12 },
  heroTitle: { color: theme.colors.text, fontSize: theme.typography.title, fontWeight: "900", lineHeight: 34 },
  sectionTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h1 },
  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  smallTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.body },
  big: { color: theme.colors.text, fontSize: 30, fontWeight: "900" },
  muted: { color: theme.colors.muted, fontWeight: "700", lineHeight: 21 },
  mutedStrong: { color: theme.colors.muted, fontWeight: "800", lineHeight: 21 },
  compactCard: { gap: theme.spacing.sm },
  progressGroup: { gap: theme.spacing.md },
  progressMetric: { gap: theme.spacing.sm },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  metricLabel: { color: theme.colors.muted, fontWeight: "800", fontSize: theme.typography.small },
  metricValue: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.small },
  stepGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  stepDone: { backgroundColor: theme.colors.success, borderColor: "#BBF7D0" },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    color: theme.colors.coupleStrong,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "900",
    overflow: "hidden"
  },
  stepNumberDone: { color: theme.colors.successStrong },
  stepText: { color: theme.colors.text, fontWeight: "800" },
  stepTextDone: { color: theme.colors.successStrong },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  miniMetric: {
    flexGrow: 1,
    minWidth: 145,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    padding: theme.spacing.md,
    gap: theme.spacing.xs
  },
  miniMetricSuccess: { backgroundColor: theme.colors.success, borderColor: "#BBF7D0" },
  miniMetricWarning: { backgroundColor: theme.colors.warning, borderColor: "#FBD38D" },
  miniMetricValue: { color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: "900" },
  inlineButton: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, paddingVertical: theme.spacing.xs },
  inlineButtonText: { color: theme.colors.coupleStrong, fontWeight: "900" },
  collapsibleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md },
  chartGrid: { gap: theme.spacing.lg },
  chartGridWide: { flexDirection: "row", flexWrap: "wrap" }
});

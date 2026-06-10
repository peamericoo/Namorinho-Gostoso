import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertBanner } from "../../src/components/ui/AlertBanner";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { KpiCard } from "../../src/components/ui/KpiCard";
import { Screen } from "../../src/components/ui/Screen";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { PlannedVsActualChart } from "../../src/components/charts/PlannedVsActualChart";
import { SpendingByCategoryChart } from "../../src/components/charts/SpendingByCategoryChart";
import { MonthlyEvolutionChart } from "../../src/components/charts/MonthlyEvolutionChart";
import { PersonSplitChart } from "../../src/components/charts/PersonSplitChart";
import { SettlementCard } from "../../src/components/finance/SettlementCard";
import { TripCard } from "../../src/components/finance/TripCard";
import { theme } from "../../src/constants/theme";
import { useDashboard } from "../../src/hooks/useDashboard";
import { useWorkspace } from "../../src/hooks/useWorkspace";
import { money, percent } from "../../src/lib/formatters";

export default function DashboardScreen() {
  const workspace = useWorkspace();
  const dashboard = useDashboard();
  const data = dashboard.data;

  return (
    <Screen>
      <Header title={`Oi, ${workspace.data?.profile?.display_name ?? "vocês"}`} subtitle="Resumo financeiro das próximas visitas." />
      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={180} />
        </>
      ) : (
        <>
          <View style={styles.kpiGrid}>
            <KpiCard label="Planejado" value={money(data.totalPlanned)} tone="pedro" />
            <KpiCard label="Realizado" value={money(data.totalSpent)} tone="camilly" />
            <KpiCard label="Diferença" value={money(data.plannedVsActual)} tone={data.plannedVsActual >= 0 ? "success" : "warning"} />
            <KpiCard label="Meta" value={percent(data.savings.progress * 100)} tone="couple" />
          </View>

          <SettlementCard expenses={data.expenses} settlements={data.settlements} />

          <View style={styles.actions}>
            <Button title="Nova viagem" onPress={() => router.push("/trips/new")} style={styles.actionButton} />
            <Button title="Novo gasto" variant="secondary" onPress={() => router.push("/expenses/new")} style={styles.actionButton} />
            <Button title="Simular viagem" variant="secondary" onPress={() => router.push("/(tabs)/simulator")} style={styles.actionButton} />
            <Button title="Ver acertos" variant="secondary" onPress={() => router.push("/settlements")} style={styles.actionButton} />
          </View>

          <SectionHeader title="Alertas inteligentes" />
          {data.alerts.map((alert) => <AlertBanner key={alert.message} message={alert.message} tone={alert.tone} />)}

          {data.upcomingTrip ? (
            <>
              <SectionHeader title="Próxima viagem" />
              <TripCard trip={data.upcomingTrip} expenses={data.expenses} plannedExpenses={data.plannedExpenses} onPress={() => router.push(`/trips/${data.upcomingTrip?.id}`)} />
            </>
          ) : null}

          <View style={styles.chartGrid}>
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
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  actionButton: { flexGrow: 1 },
  chartGrid: { gap: theme.spacing.lg },
  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  big: { color: theme.colors.text, fontSize: 30, fontWeight: "900" },
  muted: { color: theme.colors.muted, fontWeight: "700" }
});

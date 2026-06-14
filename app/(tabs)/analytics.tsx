import { useMemo, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { MonthlyEvolutionChart } from "../../src/components/charts/MonthlyEvolutionChart";
import { PersonSplitChart } from "../../src/components/charts/PersonSplitChart";
import { PlannedVsActualChart } from "../../src/components/charts/PlannedVsActualChart";
import { SpendingByCategoryChart } from "../../src/components/charts/SpendingByCategoryChart";
import { AnalyticsFilterBar, type AnalyticsFilters } from "../../src/components/analytics/AnalyticsFilterBar";
import { AnalyticsMetricGrid } from "../../src/components/analytics/AnalyticsMetricGrid";
import { AnalyticsRankingCard } from "../../src/components/analytics/AnalyticsRankingCard";
import { AnalyticsWidget } from "../../src/components/analytics/AnalyticsWidget";
import { Badge } from "../../src/components/ui/Badge";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { labelPerson, labelStatus } from "../../src/constants/categories";
import { useDashboard } from "../../src/hooks/useDashboard";
import { calculateExpenseResponsibility, calculateSettlement, plannedByTrip, sum, tripSummary } from "../../src/lib/calculations";
import { money } from "../../src/lib/formatters";
import type { Category, Expense, PlannedExpense, Trip } from "../../src/types/models";

const defaultFilters: AnalyticsFilters = {
  tripId: "todos",
  dateFrom: "",
  dateTo: "",
  person: "todos",
  metricMode: "realizado",
  viewMode: "categoria"
};

export default function AnalyticsScreen() {
  const dashboard = useDashboard();
  const data = dashboard.data;
  const { width } = useWindowDimensions();
  const isWide = width >= 920;
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  const scopedTrips = useMemo(() => (filters.tripId === "todos" ? data.trips : data.trips.filter((trip) => trip.id === filters.tripId)), [data.trips, filters.tripId]);
  const filteredExpenses = useMemo(() => filterExpensesForAnalytics(data.expenses, filters), [data.expenses, filters]);
  const filteredPlanned = useMemo(() => filterPlannedForAnalytics(data.plannedExpenses, filters), [data.plannedExpenses, filters]);
  const plannedTotal = useMemo(() => plannedTotalForScope(scopedTrips, filteredPlanned, data.plannedExpenses, filters), [data.plannedExpenses, filteredPlanned, filters, scopedTrips]);
  const actualTotal = useMemo(() => sum(filteredExpenses.map((expense) => expense.amount)), [filteredExpenses]);
  const settlement = useMemo(() => calculateSettlement(filteredExpenses), [filteredExpenses]);
  const highestTrip = useMemo(() => tripComparisonRows(scopedTrips, filteredExpenses, filteredPlanned, data.plannedExpenses)[0] ?? null, [data.plannedExpenses, filteredExpenses, filteredPlanned, scopedTrips]);

  return (
    <Screen>
      <Header title="Análises" subtitle="Leitura personalizável dos gastos, orçamentos e divisão do casal." />
      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={220} />
        </>
      ) : data.trips.length === 0 && data.expenses.length === 0 ? (
        <EmptyState title="Sem dados para analisar" message="Crie uma viagem e registre gastos para liberar os gráficos." />
      ) : (
        <View style={[styles.analyticsLayout, isWide && styles.analyticsLayoutWide]}>
          <View style={[styles.filtersPanel, isWide && styles.filtersPanelWide]}>
            <AnalyticsWidget title="Filtros" subtitle="Recorte da análise atual.">
              <AnalyticsFilterBar filters={filters} trips={data.trips} isWide={false} onChange={setFilters} />
            </AnalyticsWidget>
          </View>

          <View style={styles.analyticsMain}>
            <SectionTitle title="Resumo" subtitle="Os números principais do recorte selecionado." />
            <AnalyticsMetricGrid
              metrics={[
                { label: "Realizado", value: money(actualTotal), helper: `${filteredExpenses.length} gasto(s)`, tone: "couple" },
                { label: "Planejado", value: money(plannedTotal), helper: `${filteredPlanned.length} custo(s) planejado(s)`, tone: "pedro" },
                { label: "Diferença", value: money(plannedTotal - actualTotal), helper: plannedTotal - actualTotal < 0 ? "Acima do planejado" : "Dentro do planejado", tone: plannedTotal - actualTotal < 0 ? "danger" : "success" },
                { label: "Acerto", value: money(settlement.amount), helper: settlement.message, tone: settlement.amount > 0 ? "warning" : "success" }
              ]}
            />

            <SectionTitle title="Visão principal" subtitle="Gráficos para entender composição, orçamento, divisão e tempo." />
            <View style={[styles.grid, isWide && styles.gridWide]}>
              <View style={styles.widget}><SpendingByCategoryChart expenses={filteredExpenses} categories={data.categories} /></View>
              <View style={styles.widget}><PlannedVsActualChart planned={plannedTotal} actual={actualTotal} /></View>
              <View style={styles.widget}><PersonSplitChart expenses={filteredExpenses} /></View>
              <View style={styles.widget}><MonthlyEvolutionChart expenses={filteredExpenses} /></View>
            </View>

            <SectionTitle title="Detalhamento" subtitle="Quebra por categoria, pessoa ou viagem, conforme o controle escolhido." />
            <View style={[styles.grid, isWide && styles.gridWide]}>
              <View style={styles.widget}>
                <BreakdownWidget filters={filters} expenses={filteredExpenses} plannedExpenses={filteredPlanned} trips={data.trips} categories={data.categories} />
              </View>
              <View style={styles.widget}>
                <TripComparisonWidget trips={scopedTrips} expenses={filteredExpenses} plannedExpenses={filteredPlanned} allPlannedExpenses={data.plannedExpenses} />
              </View>
            </View>

            <SectionTitle title="Prioridades" subtitle="Itens que merecem atenção primeiro." />
            <View style={[styles.grid, isWide && styles.gridWide]}>
              <View style={styles.widget}>
                <AnalyticsRankingCard expenses={filteredExpenses} />
              </View>
              <View style={styles.widget}>
                <InsightWidget actualTotal={actualTotal} plannedTotal={plannedTotal} highestTrip={highestTrip} settlementAmount={settlement.amount} />
              </View>
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function filterExpensesForAnalytics(expenses: Expense[], filters: AnalyticsFilters) {
  return expenses.filter((expense) => {
    if (filters.tripId !== "todos" && expense.trip_id !== filters.tripId) return false;
    if (filters.dateFrom && expense.spent_at.slice(0, 10) < filters.dateFrom) return false;
    if (filters.dateTo && expense.spent_at.slice(0, 10) > filters.dateTo) return false;
    if (filters.person !== "todos" && expense.paid_by_person !== filters.person && expense.beneficiary_person !== filters.person) return false;
    return true;
  });
}

function filterPlannedForAnalytics(plannedExpenses: PlannedExpense[], filters: AnalyticsFilters) {
  return plannedExpenses.filter((planned) => {
    if (filters.tripId !== "todos" && planned.trip_id !== filters.tripId) return false;
    if (filters.dateFrom && planned.expected_date && planned.expected_date.slice(0, 10) < filters.dateFrom) return false;
    if (filters.dateTo && planned.expected_date && planned.expected_date.slice(0, 10) > filters.dateTo) return false;
    if ((filters.dateFrom || filters.dateTo) && !planned.expected_date) return false;
    if (filters.person !== "todos" && planned.owner_person !== filters.person && planned.paid_by_person !== filters.person && planned.beneficiary_person !== filters.person) return false;
    return true;
  });
}

function plannedTotalForScope(trips: Trip[], filteredPlanned: PlannedExpense[], allPlanned: PlannedExpense[], filters: AnalyticsFilters) {
  const plannedRowsTotal = sum(filteredPlanned.map((planned) => planned.planned_amount));
  if (filters.dateFrom || filters.dateTo || filters.person !== "todos") return plannedRowsTotal;
  return sum(trips.map((trip) => trip.planned_budget || plannedByTrip(trip.id, allPlanned)));
}

function BreakdownWidget({ filters, expenses, plannedExpenses, trips, categories }: { filters: AnalyticsFilters; expenses: Expense[]; plannedExpenses: PlannedExpense[]; trips: Trip[]; categories: Category[] }) {
  const rows = breakdownRows(filters, expenses, plannedExpenses, trips, categories);
  return (
    <AnalyticsWidget
      title="Recorte personalizável"
      subtitle={`Métrica atual: ${labelStatus(filters.metricMode)} · agrupado por ${labelStatus(filters.viewMode)}.`}
      right={<Badge label={rows.length ? `${rows.length} grupo(s)` : "Sem dados"} tone={rows.length ? "couple" : "neutral"} />}
    >
      <View style={styles.rows}>
        {rows.length === 0 ? <Text style={styles.empty}>Sem dados para esse recorte.</Text> : null}
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{row.label}</Text>
              <Text style={styles.rowMeta}>{row.helper}</Text>
            </View>
            <Text style={styles.rowAmount}>{money(row.amount)}</Text>
          </View>
        ))}
      </View>
    </AnalyticsWidget>
  );
}

function breakdownRows(filters: AnalyticsFilters, expenses: Expense[], plannedExpenses: PlannedExpense[], trips: Trip[], categories: Category[]) {
  if (filters.metricMode === "planejado") {
    return groupedAmounts(plannedExpenses, (planned) => {
      if (filters.viewMode === "pessoa") return labelPerson(planned.owner_person);
      if (filters.viewMode === "viagem") return trips.find((trip) => trip.id === planned.trip_id)?.title ?? "Sem viagem";
      return categories.find((category) => category.id === planned.category_id)?.name ?? "Sem categoria";
    }, (planned) => planned.planned_amount, "custo(s) planejado(s)");
  }

  if (filters.metricMode === "acerto") {
    const settlementRows = [
      { label: "Pedro", amount: sum(expenses.map((expense) => calculateExpenseResponsibility(expense).pedroResponsibility)), helper: "Responsabilidade no recorte" },
      { label: "Camilly", amount: sum(expenses.map((expense) => calculateExpenseResponsibility(expense).camillyResponsibility)), helper: "Responsabilidade no recorte" }
    ];
    return settlementRows.sort((a, b) => b.amount - a.amount);
  }

  return groupedAmounts(expenses, (expense) => {
    if (filters.viewMode === "pessoa") return labelPerson(expense.paid_by_person);
    if (filters.viewMode === "viagem") return expense.trip?.title ?? "Sem viagem";
    return expense.category?.name ?? "Sem categoria";
  }, (expense) => expense.amount, "gasto(s)");
}

function groupedAmounts<T>(rows: T[], keyFor: (row: T) => string, amountFor: (row: T) => number, helperLabel: string) {
  const groups = new Map<string, { label: string; amount: number; count: number }>();
  rows.forEach((row) => {
    const label = keyFor(row);
    const current = groups.get(label) ?? { label, amount: 0, count: 0 };
    current.amount += amountFor(row);
    current.count += 1;
    groups.set(label, current);
  });
  return Array.from(groups.values())
    .map((group) => ({ label: group.label, amount: group.amount, helper: `${group.count} ${helperLabel}` }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
}

function TripComparisonWidget({ trips, expenses, plannedExpenses, allPlannedExpenses }: { trips: Trip[]; expenses: Expense[]; plannedExpenses: PlannedExpense[]; allPlannedExpenses: PlannedExpense[] }) {
  const rows = tripComparisonRows(trips, expenses, plannedExpenses, allPlannedExpenses).slice(0, 6);
  return (
    <AnalyticsWidget title="Comparação entre viagens" subtitle="Veja quais viagens concentram maior realizado e risco de orçamento.">
      <View style={styles.rows}>
        {rows.length === 0 ? <Text style={styles.empty}>Sem viagens para comparar.</Text> : null}
        {rows.map((row) => (
          <View key={row.trip.id} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{row.trip.title}</Text>
              <Text style={styles.rowMeta}>Planejado {money(row.summary.planned)} · diferença {money(row.summary.difference)}</Text>
            </View>
            <Badge label={money(row.summary.actual)} tone={row.summary.difference < 0 ? "danger" : "success"} />
          </View>
        ))}
      </View>
    </AnalyticsWidget>
  );
}

function tripComparisonRows(trips: Trip[], expenses: Expense[], plannedExpenses: PlannedExpense[], allPlannedExpenses: PlannedExpense[]) {
  return trips
    .map((trip) => {
      const tripExpenses = expenses.filter((expense) => expense.trip_id === trip.id);
      const tripPlanned = plannedExpenses.filter((planned) => planned.trip_id === trip.id);
      const summary = tripSummary(trip, tripExpenses, tripPlanned.length ? tripPlanned : allPlannedExpenses);
      return { trip, summary };
    })
    .filter((row) => row.summary.actual > 0 || row.summary.planned > 0)
    .sort((a, b) => b.summary.actual - a.summary.actual);
}

function InsightWidget({ actualTotal, plannedTotal, highestTrip, settlementAmount }: { actualTotal: number; plannedTotal: number; highestTrip: ReturnType<typeof tripComparisonRows>[number] | null; settlementAmount: number }) {
  const delta = plannedTotal - actualTotal;
  return (
    <AnalyticsWidget title="Leituras rápidas" subtitle="Sinais úteis para decidir onde olhar primeiro.">
      <View style={styles.insights}>
        <Insight title={delta < 0 ? "Orçamento pressionado" : "Orçamento confortável"} message={delta < 0 ? `O recorte está ${money(Math.abs(delta))} acima do planejado.` : `Ainda há ${money(delta)} de folga no recorte.`} tone={delta < 0 ? "danger" : "success"} />
        <Insight title="Viagem de maior impacto" message={highestTrip ? `${highestTrip.trip.title} concentra ${money(highestTrip.summary.actual)} realizados.` : "Ainda não há uma viagem dominante no recorte."} tone="couple" />
        <Insight title="Acerto estimado" message={settlementAmount > 0 ? `Há ${money(settlementAmount)} de diferença para revisar.` : "A divisão do recorte está equilibrada."} tone={settlementAmount > 0 ? "warning" : "success"} />
      </View>
    </AnalyticsWidget>
  );
}

function Insight({ title, message, tone }: { title: string; message: string; tone: "couple" | "success" | "warning" | "danger" }) {
  return (
    <View style={[styles.insight, styles[tone]]}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  analyticsLayout: {
    gap: theme.spacing.lg
  },
  analyticsLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  filtersPanel: {
    gap: theme.spacing.md
  },
  filtersPanelWide: {
    width: 320,
    position: "sticky" as never,
    top: theme.spacing.lg
  },
  analyticsMain: {
    flex: 1,
    gap: theme.spacing.md
  },
  sectionTitleWrap: {
    gap: 2,
    marginTop: theme.spacing.xs
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h1,
    lineHeight: 30
  },
  sectionSubtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20
  },
  grid: {
    gap: theme.spacing.md
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  widget: {
    flex: 1,
    minWidth: 300
  },
  rows: {
    gap: theme.spacing.sm
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingBottom: theme.spacing.sm
  },
  rowCopy: {
    flex: 1
  },
  rowTitle: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  rowMeta: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 18
  },
  rowAmount: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  empty: {
    color: theme.colors.muted,
    fontWeight: "700"
  },
  insights: {
    gap: theme.spacing.md
  },
  insight: {
    minHeight: 76,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    gap: 4,
    justifyContent: "center"
  },
  couple: { backgroundColor: theme.colors.couple },
  success: { backgroundColor: theme.colors.success },
  warning: { backgroundColor: theme.colors.warning },
  danger: { backgroundColor: theme.colors.danger },
  insightTitle: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  insightMessage: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 19
  }
});

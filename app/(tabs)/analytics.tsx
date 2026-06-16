import { router } from "expo-router";
import { CheckCircle2, ChevronDown, ClipboardList, RotateCcw, SlidersHorizontal, TrendingDown, WalletCards } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { MonthlyEvolutionChart } from "../../src/components/charts/MonthlyEvolutionChart";
import { PersonSplitChart } from "../../src/components/charts/PersonSplitChart";
import { PlannedVsActualChart } from "../../src/components/charts/PlannedVsActualChart";
import { SpendingByCategoryChart } from "../../src/components/charts/SpendingByCategoryChart";
import { AnalyticsFilterBar, type AnalyticsFilters } from "../../src/components/analytics/AnalyticsFilterBar";
import { AnalyticsMetricGrid } from "../../src/components/analytics/AnalyticsMetricGrid";
import { AnalyticsWidget } from "../../src/components/analytics/AnalyticsWidget";
import { Badge } from "../../src/components/ui/Badge";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { AppModal } from "../../src/components/ui/Modal";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { labelPerson, labelStatus } from "../../src/constants/categories";
import { useDashboard } from "../../src/hooks/useDashboard";
import { calculateExpenseResponsibility, calculateSettlement, plannedByTrip, sum, tripSummary } from "../../src/lib/calculations";
import { dateBR, money } from "../../src/lib/formatters";
import type { Category, Expense, PlannedExpense, Trip } from "../../src/types/models";

const defaultFilters: AnalyticsFilters = {
  tripId: "todos",
  dateFrom: "",
  dateTo: "",
  person: "todos",
  metricMode: "realizado",
  viewMode: "categoria"
};

const ANALYTICS_MAX_WIDTH = 1360;

const visualDeckItems = [
  { id: "categoria", label: "Categorias", title: "Gastos por categoria", subtitle: "Veja quais grupos mais pesam no recorte atual." },
  { id: "orcamento", label: "Orçamento", title: "Planejado vs realizado", subtitle: "Compare limite planejado, realizado e pressão de orçamento." },
  { id: "divisao", label: "Divisão", title: "Quem pagou o quê", subtitle: "Entenda a distribuição real dos pagamentos do casal." },
  { id: "evolucao", label: "Evolução", title: "Evolução mensal", subtitle: "Acompanhe tendência planejada e realizada ao longo do tempo." }
] as const;

type VisualDeckId = (typeof visualDeckItems)[number]["id"];

const detailDeckItems = [
  { id: "recorte", label: "Recorte", title: "Recorte personalizável", subtitle: "Quebra completa do recorte atual por métrica e agrupamento." },
  { id: "viagens", label: "Viagens", title: "Comparação entre viagens", subtitle: "Compare impacto, orçamento e risco entre as viagens selecionadas." }
] as const;

type DetailDeckId = (typeof detailDeckItems)[number]["id"];

const priorityDeckItems = [
  { id: "gastos", label: "Maiores gastos", title: "Maiores gastos", subtitle: "Ranking dos registros que mais pesaram no período." },
  { id: "leituras", label: "Leituras rápidas", title: "Leituras rápidas", subtitle: "Sinais úteis para decidir onde olhar primeiro." }
] as const;

type PriorityDeckId = (typeof priorityDeckItems)[number]["id"];

export default function AnalyticsScreen() {
  const dashboard = useDashboard();
  const data = dashboard.data;
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const scopedTrips = useMemo(() => (filters.tripId === "todos" ? data.trips : data.trips.filter((trip) => trip.id === filters.tripId)), [data.trips, filters.tripId]);
  const filteredExpenses = useMemo(() => filterExpensesForAnalytics(data.expenses, filters), [data.expenses, filters]);
  const filteredPlanned = useMemo(() => filterPlannedForAnalytics(data.plannedExpenses, filters), [data.plannedExpenses, filters]);
  const plannedTotal = useMemo(() => plannedTotalForScope(scopedTrips, filteredPlanned, data.plannedExpenses, filters), [data.plannedExpenses, filteredPlanned, filters, scopedTrips]);
  const actualTotal = useMemo(() => sum(filteredExpenses.map((expense) => expense.amount)), [filteredExpenses]);
  const settlement = useMemo(() => calculateSettlement(filteredExpenses), [filteredExpenses]);
  const highestTrip = useMemo(() => tripComparisonRows(scopedTrips, filteredExpenses, filteredPlanned, data.plannedExpenses)[0] ?? null, [data.plannedExpenses, filteredExpenses, filteredPlanned, scopedTrips]);

  return (
    <Screen maxWidth={ANALYTICS_MAX_WIDTH} contentStyle={styles.screenContent}>
      {dashboard.isLoading ? (
        <>
          <Skeleton />
          <Skeleton height={220} />
        </>
      ) : data.trips.length === 0 && data.expenses.length === 0 ? (
        <EmptyState title="Sem dados para analisar" message="Crie uma viagem e registre gastos para liberar os gráficos." />
      ) : (
        <>
          <AnimatedSection style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Análises</Text>
              <Text style={styles.heroSubtitle}>Leitura personalizada dos gastos, orçamentos e divisão do casal.</Text>
            </View>
          </AnimatedSection>

          <AnimatedSection delay={60} style={styles.filterDockWrap}>
            <FilterDock
              filters={filters}
              trips={data.trips}
              onOpen={() => setFiltersOpen(true)}
              onReset={() => setFilters(defaultFilters)}
            />
          </AnimatedSection>

          <AnimatedSection delay={120} style={styles.analyticsMain}>
            <SectionTitle title="Resumo" subtitle="Os números principais do recorte selecionado." />
            <AnalyticsMetricGrid
              metrics={[
                { label: "Realizado", value: money(actualTotal), helper: `${filteredExpenses.length} gasto(s)`, tone: "couple", Icon: WalletCards },
                { label: "Planejado", value: money(plannedTotal), helper: `${filteredPlanned.length} custo(s) planejado(s)`, tone: "pedro", Icon: ClipboardList },
                { label: "Diferença", value: money(plannedTotal - actualTotal), helper: plannedTotal - actualTotal < 0 ? "Acima do planejado" : "Dentro do planejado", tone: plannedTotal - actualTotal < 0 ? "danger" : "success", Icon: TrendingDown },
                { label: "Acerto", value: money(settlement.amount), helper: settlement.message, tone: settlement.amount > 0 ? "warning" : "success", Icon: CheckCircle2 }
              ]}
            />

            <SectionTitle title="Visão principal" subtitle="Gráficos para entender composição, orçamento, divisão e tempo." />
            <View style={[styles.grid, isWide && styles.gridWide]}>
              <View style={styles.widget}>
                <AnalyticsVisualDeck expenses={filteredExpenses} categories={data.categories} plannedTotal={plannedTotal} actualTotal={actualTotal} />
              </View>
            </View>

            <SectionTitle title="Detalhamento" subtitle="Quebra por categoria, pessoa ou viagem, conforme o controle escolhido." />
            <View style={styles.grid}>
              <View style={styles.widget}>
                <AnalyticsDetailDeck filters={filters} expenses={filteredExpenses} plannedExpenses={filteredPlanned} trips={data.trips} scopedTrips={scopedTrips} categories={data.categories} allPlannedExpenses={data.plannedExpenses} />
              </View>
            </View>

            <SectionTitle title="Prioridades" subtitle="Itens que merecem atenção primeiro." />
            <View style={styles.grid}>
              <View style={styles.widget}>
                <AnalyticsPriorityDeck expenses={filteredExpenses} actualTotal={actualTotal} plannedTotal={plannedTotal} highestTrip={highestTrip} settlementAmount={settlement.amount} onViewAllExpenses={() => openExpensesWithAnalyticsFilters(filters)} />
              </View>
            </View>
          </AnimatedSection>

          <AppModal visible={filtersOpen} title="Filtros da análise" onClose={() => setFiltersOpen(false)}>
            <AnalyticsFilterBar filters={filters} trips={data.trips} isWide={isWide} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
          </AppModal>
        </>
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

function FilterDock({ filters, trips, onOpen, onReset }: { filters: AnalyticsFilters; trips: Trip[]; onOpen: () => void; onReset: () => void }) {
  const activeCount = activeAnalyticsFilterCount(filters);
  const summary = analyticsFilterSummary(filters, trips);
  return (
    <View style={styles.filterDock}>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros da análise" onPress={onOpen} style={({ pressed }) => [styles.filterDockMain, pressed && styles.pressablePressed]}>
        <View style={styles.filterDockIcon}>
          <SlidersHorizontal color="#FF3F5F" size={21} strokeWidth={2.5} />
        </View>
        <View style={styles.filterDockCopy}>
          <View style={styles.filterDockTitleRow}>
            <Text style={styles.filterDockTitle}>Filtros da análise</Text>
            <Text style={[styles.filterDockBadge, activeCount > 0 && styles.filterDockBadgeActive]}>{activeCount ? `${activeCount} ativo(s)` : "Padrão"}</Text>
          </View>
          <Text style={styles.filterDockSummary} numberOfLines={1}>{summary}</Text>
        </View>
        <ChevronDown color={theme.colors.muted} size={21} strokeWidth={2.5} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Limpar filtros" onPress={onReset} style={({ pressed }) => [styles.filterDockReset, pressed && styles.pressablePressed]}>
        <RotateCcw color={theme.colors.coupleStrong} size={17} strokeWidth={2.5} />
        <Text style={styles.filterDockResetText}>Limpar</Text>
      </Pressable>
    </View>
  );
}

function AnalyticsVisualDeck({ expenses, categories, plannedTotal, actualTotal }: { expenses: Expense[]; categories: Category[]; plannedTotal: number; actualTotal: number }) {
  const motion = useDeckMotion<VisualDeckId>("categoria");
  const activeItem = visualDeckItems.find((item) => item.id === motion.active) ?? visualDeckItems[0];

  return (
    <AnalyticsWidget
      title={activeItem.title}
      subtitle={activeItem.subtitle}
      style={styles.deckCard}
      right={<DeckTabs items={visualDeckItems} active={motion.active} onChange={motion.choose} />}
    >
      <Animated.View style={[styles.deckBody, motion.animatedStyle]}>
        {motion.active === "categoria" ? <SpendingByCategoryChart expenses={expenses} categories={categories} framed={false} /> : null}
        {motion.active === "orcamento" ? <PlannedVsActualChart planned={plannedTotal} actual={actualTotal} framed={false} /> : null}
        {motion.active === "divisao" ? <PersonSplitChart expenses={expenses} framed={false} /> : null}
        {motion.active === "evolucao" ? <MonthlyEvolutionChart expenses={expenses} plannedTotal={plannedTotal} framed={false} /> : null}
      </Animated.View>
    </AnalyticsWidget>
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

function AnalyticsDetailDeck({
  filters,
  expenses,
  plannedExpenses,
  trips,
  scopedTrips,
  categories,
  allPlannedExpenses
}: {
  filters: AnalyticsFilters;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  trips: Trip[];
  scopedTrips: Trip[];
  categories: Category[];
  allPlannedExpenses: PlannedExpense[];
}) {
  const motion = useDeckMotion<DetailDeckId>("recorte");
  const activeItem = detailDeckItems.find((item) => item.id === motion.active) ?? detailDeckItems[0];

  return (
    <AnalyticsWidget
      title={activeItem.title}
      subtitle={activeItem.subtitle}
      style={styles.deckCard}
      right={<DeckTabs items={detailDeckItems} active={motion.active} onChange={motion.choose} />}
    >
      <Animated.View style={[styles.deckBody, motion.animatedStyle]}>
        {motion.active === "recorte" ? <BreakdownContent filters={filters} expenses={expenses} plannedExpenses={plannedExpenses} trips={trips} categories={categories} /> : null}
        {motion.active === "viagens" ? <TripComparisonContent trips={scopedTrips} expenses={expenses} plannedExpenses={plannedExpenses} allPlannedExpenses={allPlannedExpenses} /> : null}
      </Animated.View>
    </AnalyticsWidget>
  );
}

function AnalyticsPriorityDeck({
  expenses,
  actualTotal,
  plannedTotal,
  highestTrip,
  settlementAmount,
  onViewAllExpenses
}: {
  expenses: Expense[];
  actualTotal: number;
  plannedTotal: number;
  highestTrip: ReturnType<typeof tripComparisonRows>[number] | null;
  settlementAmount: number;
  onViewAllExpenses: () => void;
}) {
  const motion = useDeckMotion<PriorityDeckId>("gastos");
  const activeItem = priorityDeckItems.find((item) => item.id === motion.active) ?? priorityDeckItems[0];

  return (
    <AnalyticsWidget
      title={activeItem.title}
      subtitle={activeItem.subtitle}
      style={styles.deckCard}
      right={<DeckTabs items={priorityDeckItems} active={motion.active} onChange={motion.choose} />}
    >
      <Animated.View style={[styles.deckBody, motion.animatedStyle]}>
        {motion.active === "gastos" ? <RankingContent expenses={expenses} onViewAll={onViewAllExpenses} /> : null}
        {motion.active === "leituras" ? <InsightContent actualTotal={actualTotal} plannedTotal={plannedTotal} highestTrip={highestTrip} settlementAmount={settlementAmount} /> : null}
      </Animated.View>
    </AnalyticsWidget>
  );
}

function BreakdownContent({ filters, expenses, plannedExpenses, trips, categories }: { filters: AnalyticsFilters; expenses: Expense[]; plannedExpenses: PlannedExpense[]; trips: Trip[]; categories: Category[] }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const allRows = breakdownRows(filters, expenses, plannedExpenses, trips, categories, Infinity);
  const rows = allRows.slice(0, 8);

  return (
    <>
      <View style={styles.deckSummaryRow}>
        <MiniStat label="Métrica" value={analyticsLabel(filters.metricMode)} tone="couple" />
        <MiniStat label="Agrupado por" value={analyticsLabel(filters.viewMode)} tone="neutral" />
        <MiniStat label="Grupos" value={`${allRows.length}`} tone="success" />
      </View>
      <View style={styles.rows}>
        {rows.length === 0 ? <Text style={styles.empty}>Sem dados para esse recorte.</Text> : null}
        {rows.map((row, index) => (
          <AnimatedListItem key={row.label} index={index}>
            <View style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.label}</Text>
                <Text style={styles.rowMeta}>{row.helper}</Text>
              </View>
              <Text style={styles.rowAmount}>{money(row.amount)}</Text>
            </View>
          </AnimatedListItem>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel="Ver detalhamento completo" onPress={() => setDetailOpen(true)} disabled={allRows.length === 0} style={({ pressed }) => [styles.widgetFooter, allRows.length === 0 && styles.widgetFooterDisabled, pressed && allRows.length > 0 && styles.pressablePressed]}>
          <Text style={styles.footerAction}>Ver detalhamento completo</Text>
        </Pressable>
      </View>
      <AppModal visible={detailOpen} title="Detalhamento completo" onClose={() => setDetailOpen(false)}>
        <View style={styles.modalRows}>
          <Text style={styles.modalHint}>{allRows.length} grupo(s) no recorte atual.</Text>
          {allRows.map((row, index) => (
            <AnimatedListItem key={row.label} index={index}>
              <View style={styles.modalRow}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{row.label}</Text>
                  <Text style={styles.rowMeta}>{row.helper}</Text>
                </View>
                <Text style={styles.rowAmount}>{money(row.amount)}</Text>
              </View>
            </AnimatedListItem>
          ))}
        </View>
      </AppModal>
    </>
  );
}

function TripComparisonContent({ trips, expenses, plannedExpenses, allPlannedExpenses }: { trips: Trip[]; expenses: Expense[]; plannedExpenses: PlannedExpense[]; allPlannedExpenses: PlannedExpense[] }) {
  const rows = tripComparisonRows(trips, expenses, plannedExpenses, allPlannedExpenses).slice(0, 8);
  const comparisonTotal = sum(rows.map((row) => row.summary.actual));
  const comparisonDifference = sum(rows.map((row) => row.summary.difference));

  return (
    <>
      <View style={styles.deckSummaryRow}>
        <MiniStat label="Viagens" value={`${rows.length}`} tone="neutral" />
        <MiniStat label="Realizado" value={money(comparisonTotal)} tone="couple" />
        <MiniStat label="Diferença" value={money(comparisonDifference)} tone={comparisonDifference < 0 ? "danger" : "success"} />
      </View>
      <View style={styles.rows}>
        {rows.length === 0 ? <Text style={styles.empty}>Sem viagens para comparar.</Text> : null}
        {rows.map((row, index) => (
          <AnimatedListItem key={row.trip.id} index={index}>
            <View style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.trip.title}</Text>
                <Text style={styles.rowMeta}>{dateBR(row.trip.start_date)} - {dateBR(row.trip.end_date)}</Text>
                <Text style={styles.rowMeta}>Planejado {money(row.summary.planned)} · diferença {money(row.summary.difference)}</Text>
              </View>
              <Badge label={money(row.summary.actual)} tone={row.summary.difference < 0 ? "danger" : "success"} />
            </View>
          </AnimatedListItem>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel="Ver todas as viagens" onPress={() => router.push("/trips")} style={({ pressed }) => [styles.widgetFooter, pressed && styles.pressablePressed]}>
          <Text style={styles.footerAction}>Ver todas as viagens</Text>
        </Pressable>
      </View>
    </>
  );
}

function RankingContent({ expenses, onViewAll }: { expenses: Expense[]; onViewAll: () => void }) {
  const rows = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 8);
  return (
    <View style={styles.rows}>
      {rows.length === 0 ? <Text style={styles.empty}>Sem gastos para ranquear.</Text> : null}
      {rows.map((expense, index) => (
        <AnimatedListItem key={expense.id} index={index}>
          <View style={styles.rankingRow}>
            <View style={styles.rankingPosition}>
              <Text style={styles.rankingPositionText}>{index + 1}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{expense.description}</Text>
              <Text style={styles.rowMeta}>{dateBR(expense.spent_at)} · {expense.category?.name ?? "Sem categoria"} · {expense.trip?.title ?? "Sem viagem"}</Text>
            </View>
            <Text style={styles.rowAmount}>{money(expense.amount)}</Text>
          </View>
        </AnimatedListItem>
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os gastos" onPress={onViewAll} style={({ pressed }) => [styles.widgetFooter, pressed && styles.pressablePressed]}>
        <Text style={styles.footerAction}>Ver todos os gastos</Text>
      </Pressable>
    </View>
  );
}

function InsightContent({ actualTotal, plannedTotal, highestTrip, settlementAmount }: { actualTotal: number; plannedTotal: number; highestTrip: ReturnType<typeof tripComparisonRows>[number] | null; settlementAmount: number }) {
  const delta = plannedTotal - actualTotal;
  const insights = [
    {
      title: delta < 0 ? "Orçamento pressionado" : "Orçamento confortável",
      message: delta < 0 ? `O recorte está ${money(Math.abs(delta))} acima do planejado.` : `Ainda há ${money(delta)} de folga no recorte.`,
      tone: delta < 0 ? ("danger" as const) : ("success" as const)
    },
    {
      title: "Viagem de maior impacto",
      message: highestTrip ? `${highestTrip.trip.title} concentra ${money(highestTrip.summary.actual)} realizados.` : "Ainda não há uma viagem dominante no recorte.",
      tone: "couple" as const
    },
    {
      title: "Acerto estimado",
      message: settlementAmount > 0 ? `Há ${money(settlementAmount)} de diferença para revisar.` : "A divisão do recorte está equilibrada.",
      tone: settlementAmount > 0 ? ("warning" as const) : ("success" as const)
    }
  ];

  return (
    <View style={styles.insightsGrid}>
      {insights.map((insight, index) => (
        <AnimatedListItem key={insight.title} index={index}>
          <Insight title={insight.title} message={insight.message} tone={insight.tone} />
        </AnimatedListItem>
      ))}
    </View>
  );
}

function breakdownRows(filters: AnalyticsFilters, expenses: Expense[], plannedExpenses: PlannedExpense[], trips: Trip[], categories: Category[], limit = 6) {
  if (filters.metricMode === "planejado") {
    return groupedAmounts(plannedExpenses, (planned) => {
      if (filters.viewMode === "pessoa") return labelPerson(planned.owner_person);
      if (filters.viewMode === "viagem") return trips.find((trip) => trip.id === planned.trip_id)?.title ?? "Sem viagem";
      return categories.find((category) => category.id === planned.category_id)?.name ?? "Sem categoria";
    }, (planned) => planned.planned_amount, "custo(s) planejado(s)", limit);
  }

  if (filters.metricMode === "acerto") {
    const settlementRows = [
      { label: "Pedro", amount: sum(expenses.map((expense) => calculateExpenseResponsibility(expense).pedroResponsibility)), helper: "Responsabilidade no recorte" },
      { label: "Camilly", amount: sum(expenses.map((expense) => calculateExpenseResponsibility(expense).camillyResponsibility)), helper: "Responsabilidade no recorte" }
    ];
    return settlementRows.sort((a, b) => b.amount - a.amount).slice(0, limit);
  }

  return groupedAmounts(expenses, (expense) => {
    if (filters.viewMode === "pessoa") return labelPerson(expense.paid_by_person);
    if (filters.viewMode === "viagem") return expense.trip?.title ?? "Sem viagem";
    return expense.category?.name ?? "Sem categoria";
  }, (expense) => expense.amount, "gasto(s)", limit);
}

function groupedAmounts<T>(rows: T[], keyFor: (row: T) => string, amountFor: (row: T) => number, helperLabel: string, limit = 6) {
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
    .slice(0, limit);
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "neutral" | "couple" | "success" | "danger" }) {
  return (
    <View style={[styles.miniStat, styles[`${tone}MiniStat`]]}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue} numberOfLines={1}>{value}</Text>
    </View>
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

function Insight({ title, message, tone }: { title: string; message: string; tone: "couple" | "success" | "warning" | "danger" }) {
  return (
    <View style={[styles.insight, styles[tone]]}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightMessage}>{message}</Text>
    </View>
  );
}

function analyticsLabel(value: string) {
  const labels: Record<string, string> = {
    realizado: "Realizado",
    planejado: "Planejado",
    acerto: "Acerto",
    categoria: "categoria",
    pessoa: "pessoa",
    viagem: "viagem"
  };
  return labels[value] ?? labelStatus(value);
}

function activeAnalyticsFilterCount(filters: AnalyticsFilters) {
  return (Object.keys(defaultFilters) as (keyof AnalyticsFilters)[]).filter((key) => filters[key] !== defaultFilters[key]).length;
}

function analyticsFilterSummary(filters: AnalyticsFilters, trips: Trip[]) {
  const trip = filters.tripId === "todos" ? "Todas as viagens" : trips.find((item) => item.id === filters.tripId)?.title ?? "Viagem selecionada";
  const person = filters.person === "todos" ? "Todos" : labelPerson(filters.person);
  const period = filters.dateFrom || filters.dateTo ? `${filters.dateFrom || "início"} até ${filters.dateTo || "hoje"}` : "Período completo";
  return `${trip} · ${person} · ${analyticsLabel(filters.metricMode)} por ${analyticsLabel(filters.viewMode)} · ${period}`;
}

function openExpensesWithAnalyticsFilters(filters: AnalyticsFilters) {
  const params: Record<string, string> = { source: "analytics" };
  if (filters.tripId !== "todos") params.tripId = filters.tripId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.person !== "todos") params.analyticsPerson = filters.person;
  router.push({ pathname: "/expenses", params } as never);
}

function useDeckMotion<T extends string>(initial: T) {
  const [active, setActive] = useState<T>(initial);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  function choose(next: T) {
    if (next === active) return;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0.18, duration: 95, useNativeDriver: false }),
      Animated.timing(translateX, { toValue: -14, duration: 95, useNativeDriver: false }),
      Animated.timing(scale, { toValue: 0.985, duration: 95, useNativeDriver: false })
    ]).start(() => {
      setActive(next);
      translateX.setValue(14);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 190, useNativeDriver: false }),
        Animated.spring(translateX, { toValue: 0, speed: 18, bounciness: 5, useNativeDriver: false }),
        Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 5, useNativeDriver: false })
      ]).start();
    });
  }

  return {
    active,
    choose,
    animatedStyle: {
      opacity,
      transform: [{ translateX }, { scale }]
    }
  };
}

function DeckTabs<T extends string>({ items, active, onChange }: { items: readonly { id: T; label: string }[]; active: T; onChange: (id: T) => void }) {
  return (
    <View style={styles.deckTabs}>
      {items.map((item) => (
        <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: item.id === active }} onPress={() => onChange(item.id)} style={({ pressed }) => [styles.deckTab, item.id === active && styles.deckTabActive, pressed && styles.pressablePressed]}>
          <Text style={[styles.deckTabText, item.id === active && styles.deckTabTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function AnimatedListItem({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const delay = Math.min(index * 35, 210);
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, delay, speed: 20, bounciness: 4, useNativeDriver: false })
    ]);

    animation.start();
    return () => animation.stop();
  }, [index, opacity, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay,
        useNativeDriver: false
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        speed: 17,
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
  ink: "#111827"
};

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 46,
    gap: 22
  },
  hero: {
    gap: theme.spacing.lg,
    minHeight: 82,
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700"
  },
  filterDockWrap: {
    position: "sticky" as never,
    top: 12,
    zIndex: 20
  },
  filterDock: {
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    padding: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    ...theme.shadow
  },
  filterDockMain: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md
  },
  filterDockIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: "#FFE7EB",
    alignItems: "center",
    justifyContent: "center"
  },
  filterDockCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  filterDockTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap"
  },
  filterDockTitle: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 20
  },
  filterDockBadge: {
    overflow: "hidden",
    borderRadius: theme.radius.pill,
    backgroundColor: "#F1F5F9",
    color: theme.colors.muted,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "900"
  },
  filterDockBadgeActive: {
    backgroundColor: "#FFE7EB",
    color: "#FF3F5F"
  },
  filterDockSummary: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  filterDockReset: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs
  },
  filterDockResetText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  pressablePressed: {
    opacity: 0.78,
    transform: [{ scale: 0.992 }]
  },
  analyticsMain: {
    gap: 18
  },
  sectionTitleWrap: {
    gap: 3,
    marginTop: 8
  },
  sectionTitle: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 21,
    lineHeight: 28
  },
  sectionSubtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 20
  },
  grid: {
    gap: 18
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  widget: {
    flex: 1,
    minWidth: 0
  },
  widgetWide: {
    flexBasis: "48%",
    minWidth: 440
  },
  deckCard: {
    minHeight: 430
  },
  deckTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.spacing.xs,
    maxWidth: 560
  },
  deckTab: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  deckTabActive: {
    backgroundColor: "#FFE7EB",
    borderColor: "#FFD2DC"
  },
  deckTabText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  deckTabTextActive: {
    color: "#FF3F5F"
  },
  deckBody: {
    minHeight: 304,
    justifyContent: "center",
    gap: theme.spacing.md
  },
  deckSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  rows: {
    gap: 0
  },
  row: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: 9
  },
  rowCopy: {
    flex: 1,
    minWidth: 0
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900"
  },
  rowMeta: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 17
  },
  rowAmount: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  widgetFooter: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm
  },
  widgetFooterDisabled: {
    opacity: 0.5
  },
  footerAction: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  empty: {
    color: theme.colors.muted,
    fontWeight: "700"
  },
  modalRows: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md
  },
  modalHint: {
    color: theme.colors.muted,
    fontWeight: "800",
    lineHeight: 19
  },
  modalRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  comparisonStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  miniStat: {
    flex: 1,
    minWidth: 128,
    minHeight: 72,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: "center",
    gap: 2
  },
  neutralMiniStat: {
    backgroundColor: "#F8FAFC",
    borderColor: theme.colors.line
  },
  coupleMiniStat: {
    backgroundColor: "#F4EFFF",
    borderColor: "#DED3FF"
  },
  successMiniStat: {
    backgroundColor: "#EEFFF6",
    borderColor: "#CBEFD9"
  },
  dangerMiniStat: {
    backgroundColor: "#FFF1F4",
    borderColor: "#FFD2DC"
  },
  miniStatLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  miniStatValue: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  insight: {
    flex: 1,
    minWidth: 260,
    minHeight: 92,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: 4,
    justifyContent: "center"
  },
  couple: { backgroundColor: "#F4EFFF", borderColor: "#DED3FF" },
  success: { backgroundColor: "#EEFFF6", borderColor: "#CBEFD9" },
  warning: { backgroundColor: "#FFF8E5", borderColor: "#F6E4B5" },
  danger: { backgroundColor: "#FFF1F4", borderColor: "#FFD2DC" },
  insightTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  insightMessage: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 19
  },
  rankingRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: 10
  },
  rankingPosition: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: "#EEE3FF",
    alignItems: "center",
    justifyContent: "center"
  },
  rankingPositionText: {
    color: theme.colors.coupleStrong,
    fontSize: 12,
    fontWeight: "900"
  }
});

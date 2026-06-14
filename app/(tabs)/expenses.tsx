import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ExpenseFiltersPanel } from "../../src/components/expenses/ExpenseFiltersPanel";
import { ExpenseList } from "../../src/components/expenses/ExpenseList";
import { ExpenseSearch } from "../../src/components/expenses/ExpenseSearch";
import { ExpenseSummary } from "../../src/components/expenses/ExpenseSummary";
import { ExpenseViewControls } from "../../src/components/expenses/ExpenseViewControls";
import { ExpenseCard } from "../../src/components/finance/ExpenseCard";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Header } from "../../src/components/ui/Header";
import { AppModal } from "../../src/components/ui/Modal";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { useCategories, useExpenses, usePlannedExpenses, useTrips } from "../../src/hooks/useFinanceData";
import {
  activeExpenseFilterCount,
  defaultExpenseFilters,
  expenseFilterChips,
  filterExpenses,
  groupExpenses,
  paymentMethodsFromExpenses,
  summarizeExpenses,
  type ExpenseFilters,
  type ExpensePersonGrouping,
  type ExpenseViewMode
} from "../../src/lib/expenseFilters";

const PAGE_SIZE = 12;

export default function ExpensesScreen() {
  const expenses = useExpenses();
  const trips = useTrips();
  const categories = useCategories();
  const plannedExpenses = usePlannedExpenses();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const [filters, setFilters] = useState<ExpenseFilters>(defaultExpenseFilters);
  const [viewMode, setViewMode] = useState<ExpenseViewMode>("todos");
  const [personGrouping, setPersonGrouping] = useState<ExpensePersonGrouping>("paid_by");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const allExpenses = useMemo(() => expenses.data ?? [], [expenses.data]);
  const filtered = useMemo(
    () => filterExpenses(allExpenses, filters, { trips: trips.data ?? [], plannedExpenses: plannedExpenses.data ?? [], allExpenses }),
    [allExpenses, filters, plannedExpenses.data, trips.data]
  );
  const summary = useMemo(() => summarizeExpenses(filtered), [filtered]);
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageExpenses = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const groups = useMemo(() => groupExpenses(pageExpenses, viewMode, personGrouping), [pageExpenses, personGrouping, viewMode]);
  const paymentMethods = useMemo(() => paymentMethodsFromExpenses(allExpenses), [allExpenses]);
  const activeCount = activeExpenseFilterCount(filters);
  const chips = expenseFilterChips(filters, {
    tripLabel: (id) => trips.data?.find((trip) => trip.id === id)?.title ?? id,
    categoryLabel: (id) => categories.data?.find((category) => category.id === id)?.name ?? id
  });

  useEffect(() => {
    setPage(1);
  }, [filters, personGrouping, viewMode]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function resetFilters() {
    setFilters(defaultExpenseFilters);
  }

  function clearFilter(key: keyof ExpenseFilters) {
    setFilters((current) => ({ ...current, [key]: defaultExpenseFilters[key] }));
  }

  return (
    <Screen>
      <Header title="Gastos" subtitle="Histórico real com busca, filtros e agrupamentos." right={<Button title="Adicionar" onPress={() => router.push("/expenses/new")} />} />

      {expenses.isLoading ? (
        <>
          <Skeleton height={150} />
          <Skeleton height={220} />
        </>
      ) : (
        <>
          <View style={[styles.layout, isWide && styles.layoutWide]}>
            <View style={styles.mainColumn}>
              <ExpenseSearch value={filters.search} onChangeText={(search) => setFilters((current) => ({ ...current, search }))} />
              <View style={styles.mobileFilterRow}>
                {!isWide ? (
                  <Button title={activeCount ? `Filtros (${activeCount})` : "Filtros"} variant="secondary" onPress={() => setFiltersOpen(true)} style={styles.mobileFilterButton} />
                ) : null}
                {activeCount ? <Button title="Limpar" variant="ghost" onPress={resetFilters} /> : null}
              </View>
              {chips.length ? <ActiveFilterChips chips={chips} onClear={clearFilter} /> : null}
              <ExpenseSummary summary={summary} />
              <ExpenseViewControls viewMode={viewMode} personGrouping={personGrouping} onViewModeChange={setViewMode} onPersonGroupingChange={setPersonGrouping} />

              {allExpenses.length === 0 ? (
                <EmptyState title="Nenhum gasto registrado" message="Adicione o primeiro gasto real para atualizar dashboard e acertos." actionLabel="Novo gasto" onAction={() => router.push("/expenses/new")} />
              ) : filtered.length === 0 ? (
                <EmptyState title="Nenhum gasto encontrado" message="A busca e os filtros ativos não retornaram gastos." actionLabel="Limpar filtros" onAction={resetFilters} />
              ) : (
                <>
                  <View style={styles.listHintRow}>
                    <Text style={styles.listHint}>Toque em um card para editar. Mostrando {pageExpenses.length} de {filtered.length} gasto(s).</Text>
                  </View>
                  <ExpenseList
                    groups={groups}
                    renderExpense={(expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        onPress={() => router.push(`/expenses/${expense.id}`)}
                      />
                    )}
                  />
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </View>

            {isWide ? (
              <View style={styles.filterColumn}>
                <Card>
                  <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>Filtros</Text>
                    <Text style={styles.filterCount}>{activeCount ? `${activeCount} ativo(s)` : "Todos"}</Text>
                  </View>
                  <ExpenseFiltersPanel
                    filters={filters}
                    trips={trips.data ?? []}
                    categories={categories.data ?? []}
                    paymentMethods={paymentMethods}
                    isWide={false}
                    onChange={setFilters}
                    onReset={resetFilters}
                  />
                </Card>
              </View>
            ) : null}
          </View>

          <AppModal visible={filtersOpen} title="Filtrar gastos" onClose={() => setFiltersOpen(false)}>
            <ExpenseFiltersPanel
              filters={filters}
              trips={trips.data ?? []}
              categories={categories.data ?? []}
              paymentMethods={paymentMethods}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </AppModal>
        </>
      )}
    </Screen>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <Card style={styles.pagination}>
      <Button title="Anterior" variant="secondary" disabled={page <= 1} onPress={() => onPageChange(Math.max(page - 1, 1))} />
      <Text style={styles.pageText}>Página {page} de {totalPages}</Text>
      <Button title="Próxima" variant="secondary" disabled={page >= totalPages} onPress={() => onPageChange(Math.min(page + 1, totalPages))} />
    </Card>
  );
}

function ActiveFilterChips({
  chips,
  onClear
}: {
  chips: { key: keyof ExpenseFilters; label: string }[];
  onClear: (key: keyof ExpenseFilters) => void;
}) {
  return (
    <View style={styles.chips}>
      {chips.map((chip) => (
        <Pressable key={`${chip.key}-${chip.label}`} accessibilityRole="button" accessibilityLabel={`Remover ${chip.label}`} onPress={() => onClear(chip.key)} style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
          <Text style={styles.chipText}>{chip.label}</Text>
          <Text style={styles.chipX}>×</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    gap: theme.spacing.lg
  },
  layoutWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: theme.spacing.lg
  },
  filterColumn: {
    width: 320,
    position: "sticky" as never,
    top: theme.spacing.lg
  },
  mobileFilterRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    flexWrap: "wrap"
  },
  mobileFilterButton: {
    flexGrow: 1
  },
  listHintRow: {
    marginTop: -theme.spacing.sm
  },
  listHint: {
    color: theme.colors.muted,
    fontWeight: "800",
    lineHeight: 20
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7
  },
  chipPressed: {
    opacity: 0.75
  },
  chipText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: theme.typography.small
  },
  chipX: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    fontSize: 14
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  filterTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h2
  },
  filterCount: {
    color: theme.colors.muted,
    fontWeight: "900"
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    shadowOpacity: 0.04
  },
  pageText: {
    color: theme.colors.text,
    fontWeight: "900",
    textAlign: "center"
  }
});

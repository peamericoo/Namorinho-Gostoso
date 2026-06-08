import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ExpenseCard } from "../../src/components/finance/ExpenseCard";
import { Button } from "../../src/components/ui/Button";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { theme } from "../../src/constants/theme";
import { useExpenses } from "../../src/hooks/useFinanceData";
import { money } from "../../src/lib/formatters";
import { useFiltersStore } from "../../src/store/filters.store";

export default function ExpensesScreen() {
  const expenses = useExpenses();
  const filters = useFiltersStore();
  const filtered = useMemo(() => {
    const search = filters.expenseSearch.toLowerCase();
    return (expenses.data ?? []).filter((expense) => !search || `${expense.description} ${expense.payment_method ?? ""} ${expense.category?.name ?? ""}`.toLowerCase().includes(search));
  }, [expenses.data, filters.expenseSearch]);
  const total = filtered.reduce((acc, expense) => acc + expense.amount, 0);

  return (
    <Screen>
      <Header title="Gastos" subtitle="Histórico real com divisão e comprovantes." right={<Button title="Adicionar" onPress={() => router.push("/expenses/new")} />} />
      <Input label="Buscar" value={filters.expenseSearch} onChangeText={filters.setExpenseSearch} placeholder="Descrição, categoria ou forma de pagamento" />
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total visível</Text>
        <Text style={styles.totalValue}>{money(total)}</Text>
      </View>
      {expenses.isLoading ? <Skeleton height={160} /> : filtered.length === 0 ? (
        <EmptyState title="Nenhum gasto registrado" message="Adicione o primeiro gasto real para atualizar dashboard e acertos." actionLabel="Novo gasto" onAction={() => router.push("/expenses/new")} />
      ) : (
        filtered.map((expense) => <ExpenseCard key={expense.id} expense={expense} onPress={() => router.push(`/expenses/${expense.id}`)} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.line },
  totalLabel: { color: theme.colors.muted, fontWeight: "800" },
  totalValue: { color: theme.colors.text, fontWeight: "900", fontSize: 28 }
});

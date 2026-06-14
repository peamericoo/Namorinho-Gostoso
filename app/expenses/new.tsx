import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ExpenseForm } from "../../src/components/forms/ExpenseForm";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { useCategories, useExpense, useExpenseMutations, useTrips } from "../../src/hooks/useFinanceData";
import { useWorkspace } from "../../src/hooks/useWorkspace";
import { todayISO } from "../../src/lib/dates";
import type { Expense } from "../../src/types/models";

export default function NewExpenseScreen() {
  const { tripId, duplicateId } = useLocalSearchParams<{ tripId?: string; duplicateId?: string }>();
  const workspace = useWorkspace();
  const trips = useTrips();
  const categories = useCategories();
  const duplicate = useExpense(duplicateId);
  const mutations = useExpenseMutations();
  const duplicateInitialValues = useMemo<Partial<Expense> | undefined>(() => {
    if (!duplicate.data) return undefined;
    return {
      ...duplicate.data,
      id: undefined,
      created_by: undefined,
      spent_at: todayISO(),
      receipt_url: "",
      current_installment: 1
    };
  }, [duplicate.data]);
  const waitingForDuplicate = Boolean(duplicateId) && duplicate.isLoading;

  return (
    <Screen>
      <Header title={duplicateId ? "Duplicar gasto" : "Novo gasto"} subtitle="Registre um gasto real e a divisão entre Pedro e Camilly." back onBack={() => router.replace("/(tabs)/expenses")} />
      <Card>
        {waitingForDuplicate ? (
          <Skeleton height={160} />
        ) : workspace.data?.couple ? (
          <ExpenseForm
            coupleId={workspace.data.couple.id}
            trips={trips.data ?? []}
            categories={categories.data ?? []}
            initialTripId={tripId}
            initialValues={duplicateInitialValues}
            loading={mutations.create.isPending}
            onSubmit={async (values) => {
              return mutations.create.mutateAsync(values);
            }}
            afterSubmit={() => router.replace("/(tabs)/expenses")}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

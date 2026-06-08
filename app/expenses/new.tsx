import { router } from "expo-router";
import { ExpenseForm } from "../../src/components/forms/ExpenseForm";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useCategories, useExpenseMutations, useTrips } from "../../src/hooks/useFinanceData";
import { useWorkspace } from "../../src/hooks/useWorkspace";

export default function NewExpenseScreen() {
  const workspace = useWorkspace();
  const trips = useTrips();
  const categories = useCategories();
  const mutations = useExpenseMutations();
  return (
    <Screen>
      <Header title="Novo gasto" subtitle="Registre um gasto real e a divisão entre Pedro e Camilly." />
      <Card>
        {workspace.data?.couple ? (
          <ExpenseForm
            coupleId={workspace.data.couple.id}
            trips={trips.data ?? []}
            categories={categories.data ?? []}
            loading={mutations.create.isPending}
            onSubmit={async (values) => {
              await mutations.create.mutateAsync(values);
              router.replace("/(tabs)/expenses");
            }}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

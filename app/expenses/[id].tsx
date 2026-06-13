import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ExpenseForm } from "../../src/components/forms/ExpenseForm";
import { Card } from "../../src/components/ui/Card";
import { DeleteButton } from "../../src/components/ui/DeleteButton";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useCategories, useExpense, useExpenseMutations, useTrips } from "../../src/hooks/useFinanceData";
import { useWorkspace } from "../../src/hooks/useWorkspace";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workspace = useWorkspace();
  const expense = useExpense(id);
  const trips = useTrips();
  const categories = useCategories();
  const mutations = useExpenseMutations();
  return (
    <Screen>
      <Header title="Editar gasto" subtitle={expense.data?.description ?? "Atualize o registro real."} back onBack={() => router.replace("/(tabs)/expenses")} />
      <Card>
        {workspace.data?.couple && expense.data ? (
          <ExpenseForm
            coupleId={workspace.data.couple.id}
            trips={trips.data ?? []}
            categories={categories.data ?? []}
            initialValues={expense.data}
            loading={mutations.update.isPending}
            onSubmit={async (values) => {
              return mutations.update.mutateAsync({ id: expense.data!.id, values });
            }}
            afterSubmit={() => router.replace("/(tabs)/expenses")}
          />
        ) : null}
      </Card>
      <View>
        <DeleteButton
          title="Excluir gasto"
          confirmTitle="Excluir gasto"
          message="Essa ação remove o gasto real e atualiza o dashboard e os acertos do casal."
          loading={mutations.remove.isPending}
          onConfirm={async () => {
            await mutations.remove.mutateAsync(id);
            router.replace("/(tabs)/expenses");
          }}
        />
      </View>
    </Screen>
  );
}

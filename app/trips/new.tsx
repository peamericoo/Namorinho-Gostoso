import { router } from "expo-router";
import { TripForm } from "../../src/components/forms/TripForm";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { useTripMutations } from "../../src/hooks/useFinanceData";

export default function NewTripScreen() {
  const mutations = useTripMutations();
  return (
    <Screen>
      <Header title="Nova viagem" subtitle="Cadastre encontros futuros ou viagens já realizadas." back onBack={() => router.replace("/(tabs)/trips")} />
      <Card>
        <TripForm
          loading={mutations.create.isPending}
          onSubmit={async (values) => {
            await mutations.create.mutateAsync(values);
            router.replace("/(tabs)/trips");
          }}
        />
      </Card>
    </Screen>
  );
}

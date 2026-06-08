import { router, useLocalSearchParams } from "expo-router";
import { TripForm } from "../../../src/components/forms/TripForm";
import { Card } from "../../../src/components/ui/Card";
import { Header } from "../../../src/components/ui/Header";
import { Screen } from "../../../src/components/ui/Screen";
import { useTrip, useTripMutations } from "../../../src/hooks/useFinanceData";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(id);
  const mutations = useTripMutations();
  return (
    <Screen>
      <Header title="Editar viagem" subtitle={trip.data?.title ?? "Atualize os dados principais."} />
      <Card>
        {trip.data ? (
          <TripForm
            initialValues={trip.data}
            loading={mutations.update.isPending}
            onSubmit={async (values) => {
              await mutations.update.mutateAsync({ id: trip.data!.id, values });
              router.replace(`/trips/${trip.data!.id}`);
            }}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

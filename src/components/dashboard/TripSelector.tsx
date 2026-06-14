import { View } from "react-native";
import { dateBR } from "../../lib/formatters";
import type { Trip } from "../../types/models";
import { Select } from "../ui/Select";

export function TripSelector({ trips, selectedTripId, onChange }: { trips: Trip[]; selectedTripId: string; onChange: (tripId: string) => void }) {
  if (trips.length === 0) return <View />;
  return (
    <Select
      label="Viagem do painel"
      value={selectedTripId}
      onChange={onChange}
      options={trips.map((trip) => ({
        value: trip.id,
        label: `${trip.title} · ${dateBR(trip.start_date)} - ${dateBR(trip.end_date)}`
      }))}
    />
  );
}

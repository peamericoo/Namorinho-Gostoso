import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { personOptions, tripKindOptions } from "../../src/components/forms/formOptions";
import { PlannedVsActualChart } from "../../src/components/charts/PlannedVsActualChart";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { DateInput } from "../../src/components/ui/DateInput";
import { Header } from "../../src/components/ui/Header";
import { Input } from "../../src/components/ui/Input";
import { MoneyInput } from "../../src/components/ui/MoneyInput";
import { Screen } from "../../src/components/ui/Screen";
import { Select } from "../../src/components/ui/Select";
import { theme } from "../../src/constants/theme";
import { useTripMutations } from "../../src/hooks/useFinanceData";
import { calculateSimulation } from "../../src/lib/calculations";
import { todayISO } from "../../src/lib/dates";
import { money } from "../../src/lib/formatters";
import { buildTripDirection, companionOf } from "../../src/lib/productFlow";
import { simulatorSchema } from "../../src/lib/validators";

type InputValues = z.input<typeof simulatorSchema>;
type Values = z.output<typeof simulatorSchema>;

const simulatorDefaults: InputValues = {
  trip_kind: "",
  traveler_person: "",
  origin_city: "",
  destination_city: "",
  startDate: "",
  endDate: "",
  lodgingType: "",
  ticketAmount: "",
  lodgingPerNight: "",
  foodPerDay: "",
  localTransportPerDay: "",
  leisurePerDay: "",
  giftsAmount: "",
  beautyAmount: "",
  groceriesAmount: "",
  emergencyAmount: "",
  safetyMarginPercent: "",
  pedroPercent: "",
  camillyPercent: "",
  monthsUntilTrip: "",
  currentSavings: ""
} as unknown as InputValues;

function numeric(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function previewValues(values: InputValues): Values {
  const startDate = typeof values.startDate === "string" && values.startDate ? values.startDate : todayISO();
  const endDate = typeof values.endDate === "string" && values.endDate ? values.endDate : startDate;
  return {
    trip_kind: values.trip_kind === "visit" ? "visit" : "shared_destination",
    traveler_person: values.traveler_person === "camilly" ? "camilly" : "pedro",
    origin_city: typeof values.origin_city === "string" ? values.origin_city : "",
    destination_city: typeof values.destination_city === "string" ? values.destination_city : "",
    startDate,
    endDate,
    lodgingType: typeof values.lodgingType === "string" ? values.lodgingType : "",
    ticketAmount: numeric(values.ticketAmount),
    lodgingPerNight: numeric(values.lodgingPerNight),
    foodPerDay: numeric(values.foodPerDay),
    localTransportPerDay: numeric(values.localTransportPerDay),
    leisurePerDay: numeric(values.leisurePerDay),
    giftsAmount: numeric(values.giftsAmount),
    beautyAmount: numeric(values.beautyAmount),
    groceriesAmount: numeric(values.groceriesAmount),
    emergencyAmount: numeric(values.emergencyAmount),
    safetyMarginPercent: numeric(values.safetyMarginPercent),
    pedroPercent: numeric(values.pedroPercent),
    camillyPercent: numeric(values.camillyPercent),
    monthsUntilTrip: Math.max(numeric(values.monthsUntilTrip, 1), 1),
    currentSavings: numeric(values.currentSavings)
  };
}

export default function SimulatorScreen() {
  const trips = useTripMutations();
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: simulatorDefaults
  });
  const watchedValues = form.watch();
  const values = previewValues(watchedValues);
  const result = calculateSimulation(values);
  const tripKind = form.watch("trip_kind");

  async function saveAsTrip() {
    const valid = await form.trigger();
    const parsed = simulatorSchema.safeParse(form.getValues());
    if (!valid || !parsed.success) return;
    const values = parsed.data;
    const result = calculateSimulation(values);
    const hostPerson = companionOf(values.traveler_person) as Values["traveler_person"];
    await trips.create.mutateAsync({
      title: values.trip_kind === "shared_destination" ? `Viagem para ${values.destination_city}` : `Encontro ${values.origin_city} → ${values.destination_city}`,
      trip_kind: values.trip_kind,
      traveler_person: values.traveler_person,
      host_person: hostPerson,
      direction: buildTripDirection(values.traveler_person, hostPerson, values.trip_kind, values.destination_city),
      origin_city: values.origin_city,
      destination_city: values.destination_city,
      start_date: values.startDate,
      end_date: values.endDate,
      status: "planejada",
      purpose: values.trip_kind === "shared_destination" ? "Viagem dos dois criada a partir do simulador." : "Visita criada a partir do simulador.",
      planned_budget: result.grandTotal,
      priority: result.viability === "Risco alto" ? "alta" : "media"
    });
    router.push("/(tabs)/trips");
  }

  return (
    <Screen>
      <Header title="Simulador" subtitle="Estime custos para visitas ou viagens dos dois para outro destino." />
      <Card>
        <Controller control={form.control} name="trip_kind" render={({ field }) => <Select label="Tipo de viagem" value={field.value} onChange={field.onChange} options={tripKindOptions} error={form.formState.errors.trip_kind?.message} />} />
        <Controller
          control={form.control}
          name="traveler_person"
          render={({ field }) => (
            <Select
              label={tripKind === "visit" ? "Quem vai viajar?" : "Responsável principal"}
              value={field.value}
              onChange={field.onChange}
              options={personOptions}
              error={form.formState.errors.traveler_person?.message}
            />
          )}
        />
        <Controller control={form.control} name="origin_city" render={({ field }) => <Input label={tripKind === "visit" ? "Cidade de partida" : "Cidade/base de partida"} value={field.value} onChangeText={field.onChange} error={form.formState.errors.origin_city?.message} />} />
        <Controller control={form.control} name="destination_city" render={({ field }) => <Input label={tripKind === "visit" ? "Cidade do encontro" : "Destino da viagem"} value={field.value} onChangeText={field.onChange} error={form.formState.errors.destination_city?.message} />} />
        <View style={styles.grid}>
          <Controller control={form.control} name="startDate" render={({ field }) => <DateInput label="Ida" value={field.value} onChangeText={field.onChange} error={form.formState.errors.startDate?.message} />} />
          <Controller control={form.control} name="endDate" render={({ field }) => <DateInput label="Volta" value={field.value} onChangeText={field.onChange} error={form.formState.errors.endDate?.message} />} />
        </View>
        <Controller control={form.control} name="lodgingType" render={({ field }) => <Input label="Tipo de hospedagem" value={field.value} onChangeText={field.onChange} error={form.formState.errors.lodgingType?.message} />} />
        {[
          ["ticketAmount", "Valor da passagem"],
          ["lodgingPerNight", "Hospedagem/noite"],
          ["foodPerDay", "Alimentação/dia"],
          ["localTransportPerDay", "Transporte local/dia"],
          ["leisurePerDay", "Lazer/dia"],
          ["giftsAmount", "Presentes/mimos"],
          ["beautyAmount", "Beleza/autocuidado"],
          ["groceriesAmount", "Mercado/casa"],
          ["emergencyAmount", "Emergências"]
        ].map(([name, label]) => (
          <Controller key={name} control={form.control} name={name as keyof InputValues} render={({ field }) => <MoneyInput label={label} value={String(field.value ?? "")} onChangeText={field.onChange} />} />
        ))}
        {[
          ["safetyMarginPercent", "Margem de segurança %"],
          ["pedroPercent", "Divisão Pedro %"],
          ["camillyPercent", "Divisão Camilly %"],
          ["monthsUntilTrip", "Meses até a viagem"],
          ["currentSavings", "Economia atual disponível"]
        ].map(([name, label]) => (
          <Controller key={name} control={form.control} name={name as keyof InputValues} render={({ field }) => <Input label={label} value={String(field.value ?? "")} onChangeText={field.onChange} keyboardType="decimal-pad" />} />
        ))}
      </Card>
      <Card>
        <Text style={styles.resultTitle}>Resultado</Text>
        <Text style={styles.result}>{money(result.grandTotal)}</Text>
        <Text style={styles.meta}>Custo por dia: {money(result.costPerDay)}</Text>
        <Text style={styles.meta}>Pedro: {money(result.pedroTotal)} · Camilly: {money(result.camillyTotal)}</Text>
        <Text style={styles.meta}>Economia recomendada por mês: {money(result.monthlyRequired)}</Text>
        <Text style={styles.viability}>{result.viability}</Text>
        <Text style={styles.meta}>{result.riskAlert}</Text>
        <Text style={styles.meta}>{result.suggestion}</Text>
        <Button title="Salvar como viagem" onPress={saveAsTrip} loading={trips.create.isPending} />
      </Card>
      <PlannedVsActualChart planned={result.grandTotal} actual={Math.max(result.grandTotal - values.currentSavings, 0)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: theme.spacing.md },
  resultTitle: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  result: { color: theme.colors.text, fontWeight: "900", fontSize: 34 },
  meta: { color: theme.colors.muted, fontWeight: "700", lineHeight: 21 },
  viability: { color: theme.colors.coupleStrong, fontWeight: "900", fontSize: 18 }
});

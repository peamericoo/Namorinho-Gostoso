import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { personOptions } from "../../src/components/forms/formOptions";
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
import { money } from "../../src/lib/formatters";
import { simulatorSchema } from "../../src/lib/validators";

type InputValues = z.input<typeof simulatorSchema>;
type Values = z.output<typeof simulatorSchema>;

const simulatorDefaults: InputValues = {
  traveler_person: "pedro",
  origin_city: "Joao Pessoa",
  destination_city: "Cuiaba",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
  lodgingType: "Airbnb",
  ticketAmount: 1200,
  lodgingPerNight: 220,
  foodPerDay: 95,
  localTransportPerDay: 45,
  leisurePerDay: 70,
  giftsAmount: 150,
  beautyAmount: 80,
  groceriesAmount: 260,
  emergencyAmount: 300,
  safetyMarginPercent: 12,
  pedroPercent: 50,
  camillyPercent: 50,
  monthsUntilTrip: 4,
  currentSavings: 900
};

export default function SimulatorScreen() {
  const trips = useTripMutations();
  const form = useForm<InputValues, unknown, Values>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      traveler_person: "pedro",
      origin_city: "João Pessoa",
      destination_city: "Cuiabá",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
      lodgingType: "Airbnb",
      ticketAmount: 1200,
      lodgingPerNight: 220,
      foodPerDay: 95,
      localTransportPerDay: 45,
      leisurePerDay: 70,
      giftsAmount: 150,
      beautyAmount: 80,
      groceriesAmount: 260,
      emergencyAmount: 300,
      safetyMarginPercent: 12,
      pedroPercent: 50,
      camillyPercent: 50,
      monthsUntilTrip: 4,
      currentSavings: 900
    }
  });
  const parsedValues = simulatorSchema.safeParse(form.watch());
  const values = parsedValues.success ? parsedValues.data : simulatorSchema.parse(simulatorDefaults);
  const result = calculateSimulation(values);

  async function saveAsTrip() {
    const valid = await form.trigger();
    if (!valid) return;
    await trips.create.mutateAsync({
      title: `Simulação ${values.origin_city} → ${values.destination_city}`,
      traveler_person: values.traveler_person,
      host_person: values.traveler_person === "pedro" ? "camilly" : "pedro",
      direction: values.traveler_person === "pedro" ? "Pedro visita Camilly" : "Camilly visita Pedro",
      origin_city: values.origin_city,
      destination_city: values.destination_city,
      start_date: values.startDate,
      end_date: values.endDate,
      status: "planejada",
      purpose: "Criada a partir do simulador.",
      planned_budget: result.grandTotal,
      priority: result.viability === "Risco alto" ? "alta" : "media"
    });
    router.push("/(tabs)/trips");
  }

  return (
    <Screen>
      <Header title="Simulador" subtitle="Estime o custo antes de confirmar uma visita." />
      <Card>
        <Controller control={form.control} name="traveler_person" render={({ field }) => <Select label="Pessoa viajando" value={field.value} onChange={field.onChange} options={personOptions} />} />
        <Controller control={form.control} name="origin_city" render={({ field }) => <Input label="Cidade origem" value={field.value} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="destination_city" render={({ field }) => <Input label="Cidade destino" value={field.value} onChangeText={field.onChange} />} />
        <View style={styles.grid}>
          <Controller control={form.control} name="startDate" render={({ field }) => <DateInput label="Data ida" value={field.value} onChangeText={field.onChange} error={form.formState.errors.startDate?.message} />} />
          <Controller control={form.control} name="endDate" render={({ field }) => <DateInput label="Data volta" value={field.value} onChangeText={field.onChange} error={form.formState.errors.endDate?.message} />} />
        </View>
        <Controller control={form.control} name="lodgingType" render={({ field }) => <Input label="Tipo de hospedagem" value={field.value} onChangeText={field.onChange} />} />
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

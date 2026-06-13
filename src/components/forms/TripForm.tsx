import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { theme } from "../../constants/theme";
import { todayISO } from "../../lib/dates";
import { buildTripDirection, companionOf } from "../../lib/productFlow";
import { deriveTripStatusFromDates, isManualTripStatus } from "../../lib/tripLifecycle";
import { tripSchema } from "../../lib/validators";
import type { Trip } from "../../types/models";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { DateInput } from "../ui/DateInput";
import { Input } from "../ui/Input";
import { MoneyInput } from "../ui/MoneyInput";
import { Select } from "../ui/Select";
import { personOptions, priorityOptions, statusOptions, tripKindOptions } from "./formOptions";

type TripFormInput = z.input<typeof tripSchema>;
type TripFormValues = z.output<typeof tripSchema>;

const fieldLabels: Record<string, string> = {
  title: "nome do encontro",
  trip_kind: "tipo de viagem",
  traveler_person: "quem vai viajar",
  host_person: "quem vai receber",
  direction: "resumo da viagem",
  origin_city: "cidade de partida",
  destination_city: "cidade do encontro",
  start_date: "data de ida",
  end_date: "data de volta",
  status: "status",
  priority: "prioridade",
  planned_budget: "orçamento estimado"
};

function defaultTripValues(): TripFormInput {
  const today = todayISO();
  return {
    title: "",
    trip_kind: "visit",
    traveler_person: "pedro",
    host_person: "camilly",
    direction: "Pedro visita Camilly",
    origin_city: "",
    destination_city: "",
    start_date: today,
    end_date: today,
    status: "em_andamento",
    purpose: "",
    planned_budget: 0,
    priority: "media",
    tickets_url: "",
    accommodation_url: "",
    itinerary_url: "",
    ticket_deadline: "",
    accommodation_deadline: "",
    notes: ""
  };
}

export function TripForm({ initialValues, onSubmit, loading }: { initialValues?: Partial<Trip>; onSubmit: (values: TripFormValues) => void | Promise<void>; loading?: boolean }) {
  const [submitError, setSubmitError] = useState("");
  const form = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: { ...defaultTripValues(), ...initialValues } as TripFormInput
  });
  const errors = form.formState.errors;
  const tripKind = form.watch("trip_kind");
  const traveler = form.watch("traveler_person");
  const host = form.watch("host_person");
  const destinationCity = form.watch("destination_city");
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const status = form.watch("status");

  useEffect(() => {
    if (traveler === host) {
      form.setValue("host_person", companionOf(traveler), { shouldDirty: true, shouldValidate: true });
    }
  }, [form, host, traveler]);

  useEffect(() => {
    form.setValue("direction", buildTripDirection(traveler, host, tripKind, destinationCity), { shouldDirty: true, shouldValidate: true });
  }, [destinationCity, form, host, traveler, tripKind]);

  useEffect(() => {
    if (!startDate || !endDate || isManualTripStatus(status)) return;
    const nextStatus = deriveTripStatusFromDates(startDate, endDate);
    if (status !== nextStatus) {
      form.setValue("status", nextStatus, { shouldDirty: true, shouldValidate: true });
    }
  }, [endDate, form, startDate, status]);

  async function submitValid(values: TripFormValues) {
    setSubmitError("");
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Não foi possível salvar a viagem.");
    }
  }

  function submitInvalid(formErrors: FieldErrors<TripFormInput>) {
    setSubmitError(buildErrorSummary(formErrors));
  }

  return (
    <View style={styles.form}>
      <FormStep number={1} title="Tipo, direção e cidades" description="Escolha entre visita de um para o outro ou uma viagem dos dois para outro destino." />
      <Controller control={form.control} name="title" render={({ field }) => <Input label="Nome do encontro" value={field.value} onChangeText={field.onChange} error={errors.title?.message} required />} />
      <Controller control={form.control} name="trip_kind" render={({ field }) => <Select label="Tipo de viagem" value={field.value} onChange={field.onChange} options={tripKindOptions} error={errors.trip_kind?.message} required />} />
      <View style={styles.grid}>
        <Controller
          control={form.control}
          name="traveler_person"
          render={({ field }) => (
            <Select
              label={tripKind === "shared_destination" ? "Responsável principal" : "Quem vai viajar?"}
              value={field.value}
              onChange={field.onChange}
              options={personOptions}
              error={errors.traveler_person?.message}
              required
            />
          )}
        />
        <Controller
          control={form.control}
          name="host_person"
          render={({ field }) => (
            <Select
              label={tripKind === "shared_destination" ? "Outra pessoa" : "Quem vai receber?"}
              value={field.value}
              onChange={field.onChange}
              options={personOptions}
              error={errors.host_person?.message}
              required
            />
          )}
        />
      </View>
      <Controller control={form.control} name="direction" render={({ field }) => <Input label="Resumo da viagem" value={field.value} onChangeText={field.onChange} error={errors.direction?.message} required />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="origin_city" render={({ field }) => <Input label={tripKind === "shared_destination" ? "Cidade/base de partida" : "Cidade de partida"} value={field.value} onChangeText={field.onChange} error={errors.origin_city?.message} required />} />
        <Controller control={form.control} name="destination_city" render={({ field }) => <Input label={tripKind === "shared_destination" ? "Destino da viagem" : "Cidade do encontro"} value={field.value} onChangeText={field.onChange} error={errors.destination_city?.message} required />} />
      </View>

      <FormStep number={2} title="Datas" description="Use datas passadas para lançar uma viagem já realizada; o status será ajustado automaticamente." />
      <View style={styles.grid}>
        <Controller control={form.control} name="start_date" render={({ field }) => <DateInput label="Ida" value={field.value} onChangeText={field.onChange} error={errors.start_date?.message} required />} />
        <Controller control={form.control} name="end_date" render={({ field }) => <DateInput label="Volta" value={field.value} onChangeText={field.onChange} error={errors.end_date?.message} required />} />
      </View>

      <FormStep number={3} title="Orçamento e status" description="Viagens futuras ficam planejadas, viagens em curso ficam em andamento e passadas ficam concluídas." />
      <View style={styles.grid}>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select
              label="Status"
              value={field.value}
              onChange={field.onChange}
              options={statusOptions}
              error={errors.status?.message}
              helperText="As datas atualizam o status; Cancelada e Adiada ficam como exceções manuais."
              required
            />
          )}
        />
        <Controller control={form.control} name="priority" render={({ field }) => <Select label="Prioridade" value={field.value} onChange={field.onChange} options={priorityOptions} error={errors.priority?.message} required />} />
      </View>
      <Controller control={form.control} name="planned_budget" render={({ field }) => <MoneyInput label="Orçamento estimado" value={String(field.value ?? "")} onChangeText={field.onChange} error={errors.planned_budget?.message} required />} />
      <Controller control={form.control} name="purpose" render={({ field }) => <Input label="Objetivo" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />

      <FormStep number={4} title="Links e detalhes" description="Guarde passagens, hospedagem, roteiro e observações no mesmo lugar." />
      <Controller control={form.control} name="tickets_url" render={({ field }) => <Input label="Link de passagens" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <Controller control={form.control} name="accommodation_url" render={({ field }) => <Input label="Link de hospedagem" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <Controller control={form.control} name="itinerary_url" render={({ field }) => <Input label="Link de roteiro" value={field.value ?? ""} onChangeText={field.onChange} autoCapitalize="none" />} />
      <View style={styles.grid}>
        <Controller control={form.control} name="ticket_deadline" render={({ field }) => <DateInput label="Data limite passagem" value={field.value ?? ""} onChangeText={field.onChange} />} />
        <Controller control={form.control} name="accommodation_deadline" render={({ field }) => <DateInput label="Data limite hospedagem" value={field.value ?? ""} onChangeText={field.onChange} />} />
      </View>
      <Controller control={form.control} name="notes" render={({ field }) => <Input label="Observações" value={field.value ?? ""} onChangeText={field.onChange} multiline />} />
      {submitError ? <AlertBanner tone="danger" message={submitError} /> : null}
      <Button title="Salvar encontro" loading={loading || form.formState.isSubmitting} onPress={form.handleSubmit(submitValid, submitInvalid)} />
    </View>
  );
}

function buildErrorSummary(formErrors: FieldErrors<TripFormInput>) {
  const labels = Object.keys(fieldLabels).filter((field) => formErrors[field as keyof TripFormInput]).map((field) => fieldLabels[field]);
  if (!labels.length) return "Revise os campos destacados antes de salvar.";
  const visibleLabels = labels.slice(0, 5).join(", ");
  const suffix = labels.length > 5 ? ` e mais ${labels.length - 5}` : "";
  return `Revise os campos: ${visibleLabels}${suffix}.`;
}

function FormStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.stepNumber}>{number}</Text>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.md },
  grid: { gap: theme.spacing.md },
  stepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.couple,
    color: theme.colors.coupleStrong,
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "900",
    overflow: "hidden"
  },
  stepCopy: { flex: 1 },
  stepTitle: { color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: "900" },
  stepDescription: { color: theme.colors.muted, fontWeight: "700", lineHeight: 20 }
});

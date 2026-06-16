import { Check, ChevronDown, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { dateBR } from "../../lib/formatters";
import type { Trip } from "../../types/models";
import { dashboardTripTitle } from "./dashboardPresentation";

type TripSelectorProps = {
  trips: Trip[];
  selectedTripId: string;
  onChange: (tripId: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function TripSelector({ trips, selectedTripId, onChange, style }: TripSelectorProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () =>
      trips.map((trip) => ({
        value: trip.id,
        label: `${dashboardTripTitle(trip.title)} | ${dateBR(trip.start_date)} - ${dateBR(trip.end_date)}`
      })),
    [trips]
  );
  const selected = options.find((option) => option.value === selectedTripId);

  if (trips.length === 0) return <View />;

  function choose(tripId: string) {
    onChange(tripId);
    setOpen(false);
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Selecionar viagem do painel"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <View style={styles.triggerCopy}>
          <Text style={styles.eyebrow}>Viagem selecionada</Text>
          <Text style={styles.value} numberOfLines={1}>
            {selected?.label ?? "Selecione uma viagem"}
          </Text>
        </View>
        <ChevronDown color={palette.ink} size={22} strokeWidth={2.4} />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.sheetHeader}>
              <View style={styles.triggerCopy}>
                <Text style={styles.eyebrow}>Selecionar</Text>
                <Text style={styles.sheetTitle}>Viagem do painel</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção" onPress={() => setOpen(false)} style={styles.closeButton}>
                <X color={palette.ink} size={20} />
              </Pressable>
            </View>
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const active = option.value === selectedTripId;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: active }}
                    onPress={() => choose(option.value)}
                    style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                      {option.label}
                    </Text>
                    {active ? <Check color={palette.primary} size={20} strokeWidth={2.8} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const palette = {
  primary: "#FF3F5F",
  primarySoft: "#FFF0F3",
  ink: "#111827"
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 460
  },
  trigger: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    ...theme.shadow
  },
  triggerPressed: {
    transform: [{ scale: 0.992 }],
    borderColor: "#FFC5D0"
  },
  triggerCopy: {
    flex: 1,
    gap: 3
  },
  eyebrow: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  value: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  sheet: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "78%",
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...theme.shadow
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  sheetTitle: {
    color: palette.ink,
    fontSize: theme.typography.h2,
    fontWeight: "900"
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  options: {
    maxHeight: 360
  },
  optionsContent: {
    gap: theme.spacing.sm
  },
  option: {
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surfaceRaised,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  optionActive: {
    borderColor: "#FFC5D0",
    backgroundColor: palette.primarySoft
  },
  optionPressed: {
    transform: [{ scale: 0.99 }]
  },
  optionText: {
    flex: 1,
    color: palette.ink,
    fontWeight: "800",
    fontSize: 15,
    lineHeight: 20
  },
  optionTextActive: {
    color: palette.primary
  }
});

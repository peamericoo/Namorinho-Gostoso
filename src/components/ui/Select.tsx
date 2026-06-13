import { Check, ChevronDown, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

type Option = { label: string; value: string };

export function Select({
  label,
  value,
  options,
  onChange,
  error,
  helperText,
  required
}: {
  label: string;
  value?: string | null;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = useMemo(() => (options.some((option) => option.value === "") ? options : [{ label: "Selecione", value: "" }, ...options]), [options]);
  const selected = useMemo(() => normalizedOptions.find((option) => option.value === value), [normalizedOptions, value]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={required ? "Campo obrigatório" : undefined}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed, open && styles.focused, error && styles.errorInput]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? "Selecione"}
        </Text>
        <ChevronDown color={theme.colors.coupleStrong} size={20} />
      </Pressable>

      {helperText && !error ? <Text style={styles.helper}>{helperText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>Selecionar</Text>
                <Text style={styles.sheetTitle}>{label}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção" onPress={() => setOpen(false)} style={styles.closeButton}>
                <X color={theme.colors.text} size={20} />
              </Pressable>
            </View>
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent} keyboardShouldPersistTaps="handled">
              {normalizedOptions.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: active }}
                    onPress={() => choose(option.value)}
                    style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                    {active ? <Check color={theme.colors.coupleStrong} size={20} /> : null}
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

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13
  },
  required: {
    color: theme.colors.dangerStrong
  },
  trigger: {
    minHeight: 58,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  pressed: {
    transform: [{ scale: 0.992 }],
    borderColor: theme.colors.focusRing
  },
  focused: {
    borderColor: theme.colors.coupleStrong,
    backgroundColor: theme.colors.surface
  },
  value: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  placeholder: {
    color: theme.colors.muted
  },
  errorInput: {
    borderColor: theme.colors.dangerStrong,
    backgroundColor: theme.colors.danger
  },
  helper: {
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    lineHeight: 17
  },
  error: {
    color: theme.colors.dangerStrong,
    fontSize: theme.typography.small,
    fontWeight: "700"
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "78%",
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
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
  sheetEyebrow: {
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "900"
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    minHeight: 48,
    borderRadius: theme.radius.md,
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
    borderColor: theme.colors.coupleStrong,
    backgroundColor: theme.colors.couple
  },
  optionPressed: {
    transform: [{ scale: 0.99 }]
  },
  optionText: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 15
  },
  optionTextActive: {
    color: theme.colors.coupleStrong
  }
});

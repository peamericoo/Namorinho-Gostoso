import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, type TextInputProps } from "react-native";
import { theme } from "../../constants/theme";

type DateInputProps = Omit<TextInputProps, "placeholder" | "onChangeText" | "value"> & {
  label: string;
  value?: string | null;
  error?: string;
  helperText?: string;
  required?: boolean;
  onChangeText?: (value: string) => void;
};

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

function parseValue(value?: string | null) {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DateInput({ label, value, error, helperText, required, onChangeText, ...props }: DateInputProps) {
  const selectedDate = parseValue(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDate ?? new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  function openCalendar() {
    setVisibleMonth(selectedDate ?? new Date());
    setOpen(true);
  }

  function choose(date: Date) {
    onChangeText?.(toISODate(date));
    setOpen(false);
  }

  const displayValue = selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecionar data";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={openCalendar}
        disabled={props.editable === false}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed, open && styles.focused, error && styles.errorInput, props.editable === false && styles.disabled]}
      >
        <View style={styles.triggerCopy}>
          <CalendarDays color={theme.colors.coupleStrong} size={20} />
          <Text style={[styles.value, !selectedDate && styles.placeholder]} numberOfLines={1}>
            {displayValue}
          </Text>
        </View>
        <Text style={styles.iso}>{value || "AAAA-MM-DD"}</Text>
      </Pressable>
      {helperText && !error ? <Text style={styles.helper}>{helperText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Calendário</Text>
                <Text style={styles.title}>{label}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar calendário" onPress={() => setOpen(false)} style={styles.closeButton}>
                <X color={theme.colors.text} size={20} />
              </Pressable>
            </View>

            <View style={styles.monthBar}>
              <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => setVisibleMonth((current) => subMonths(current, 1))} style={styles.monthButton}>
                <ChevronLeft color={theme.colors.text} size={20} />
              </Pressable>
              <Text style={styles.monthTitle}>{format(visibleMonth, "MMMM yyyy", { locale: ptBR })}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => setVisibleMonth((current) => addMonths(current, 1))} style={styles.monthButton}>
                <ChevronRight color={theme.colors.text} size={20} />
              </Pressable>
            </View>

            <View style={styles.weekdays}>
              {weekdays.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((day) => {
                const active = selectedDate ? isSameDay(day, selectedDate) : false;
                const outside = !isSameMonth(day, visibleMonth);
                const today = isSameDay(day, new Date());
                return (
                  <Pressable
                    key={day.toISOString()}
                    accessibilityRole="button"
                    accessibilityLabel={format(day, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    accessibilityState={{ selected: active }}
                    onPress={() => choose(day)}
                    style={({ pressed }) => [
                      styles.day,
                      outside && styles.dayOutside,
                      today && styles.dayToday,
                      active && styles.dayActive,
                      pressed && styles.dayPressed
                    ]}
                  >
                    <Text style={[styles.dayText, outside && styles.dayTextOutside, active && styles.dayTextActive]}>{format(day, "d")}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Pressable accessibilityRole="button" accessibilityLabel="Selecionar hoje" onPress={() => choose(new Date())} style={styles.footerButton}>
                <Text style={styles.footerButtonText}>Hoje</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar data"
                onPress={() => {
                  onChangeText?.("");
                  setOpen(false);
                }}
                style={[styles.footerButton, styles.footerButtonGhost]}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonGhostText]}>Limpar</Text>
              </Pressable>
            </View>
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
    paddingVertical: theme.spacing.sm,
    justifyContent: "center",
    gap: 4
  },
  triggerCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  pressed: {
    transform: [{ scale: 0.992 }],
    borderColor: theme.colors.focusRing
  },
  focused: {
    borderColor: theme.colors.coupleStrong,
    backgroundColor: theme.colors.surface
  },
  disabled: {
    opacity: 0.55
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
  iso: {
    marginLeft: 28,
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    fontWeight: "700"
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
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...theme.shadow
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  eyebrow: {
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
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
  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  monthTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "capitalize"
  },
  weekdays: {
    flexDirection: "row",
    gap: 6
  },
  weekday: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    fontWeight: "900",
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4
  },
  day: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  dayOutside: {
    opacity: 0.42
  },
  dayToday: {
    borderColor: theme.colors.coupleStrong
  },
  dayActive: {
    backgroundColor: theme.colors.coupleStrong,
    borderColor: theme.colors.coupleStrong
  },
  dayPressed: {
    transform: [{ scale: 0.94 }]
  },
  dayText: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  dayTextOutside: {
    color: theme.colors.muted
  },
  dayTextActive: {
    color: "#fff"
  },
  footer: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  footerButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.coupleStrong
  },
  footerButtonGhost: {
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "900"
  },
  footerButtonGhostText: {
    color: theme.colors.text
  }
});

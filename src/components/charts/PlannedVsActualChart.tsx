import { AlertTriangle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import { ChartCard } from "./ChartCard";

export function PlannedVsActualChart({ planned, actual, framed = true }: { planned: number; actual: number; framed?: boolean }) {
  const max = Math.max(planned, actual, 1);
  const delta = planned - actual;
  const content = (
    <>
      <Bar label="Planejado" value={planned} max={max} color={theme.colors.pedroStrong} />
      <Bar label="Realizado" value={actual} max={max} color={actual > planned ? theme.colors.dangerStrong : theme.colors.successStrong} />
      <View style={[styles.alert, delta < 0 ? styles.alertDanger : styles.alertSuccess]}>
        <AlertTriangle color={delta < 0 ? "#FF3F5F" : "#25A46A"} size={18} strokeWidth={2.4} />
        <Text style={styles.alertText}>
          {delta < 0 ? (
            <>
              Você está <Text style={styles.alertStrong}>{money(Math.abs(delta))}</Text> acima do planejado.
            </>
          ) : (
            <>
              Você ainda tem <Text style={styles.alertStrong}>{money(delta)}</Text> disponível.
            </>
          )}
        </Text>
      </View>
    </>
  );

  if (!framed) return <View style={styles.embedded}>{content}</View>;

  return (
    <ChartCard title="Planejado vs realizado">
      {content}
    </ChartCard>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} /></View>
      <Text style={styles.value}>{money(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  embedded: { gap: theme.spacing.md },
  row: { gap: 9 },
  label: { color: "#111827", fontWeight: "900", fontSize: 13 },
  track: { height: 15, borderRadius: theme.radius.pill, backgroundColor: "#E9EEF5", overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill },
  value: { color: theme.colors.muted, fontWeight: "900", fontSize: 15 },
  alert: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: 4
  },
  alertDanger: {
    backgroundColor: "#FFF0F2",
    borderColor: "#FFD2DC"
  },
  alertSuccess: {
    backgroundColor: "#F0FFF7",
    borderColor: "#CAEFDA"
  },
  alertText: {
    flex: 1,
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 17
  },
  alertStrong: {
    color: "#FF3F5F",
    fontWeight: "900"
  }
});

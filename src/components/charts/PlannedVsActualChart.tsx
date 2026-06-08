import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import { ChartCard } from "./ChartCard";

export function PlannedVsActualChart({ planned, actual }: { planned: number; actual: number }) {
  const max = Math.max(planned, actual, 1);
  return (
    <ChartCard title="Planejado vs realizado">
      <Bar label="Planejado" value={planned} max={max} color={theme.colors.pedroStrong} />
      <Bar label="Realizado" value={actual} max={max} color={actual > planned ? theme.colors.dangerStrong : theme.colors.successStrong} />
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
  row: { gap: 6 },
  label: { color: theme.colors.text, fontWeight: "800" },
  track: { height: 18, borderRadius: theme.radius.pill, backgroundColor: theme.colors.line, overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill },
  value: { color: theme.colors.muted, fontWeight: "800" }
});

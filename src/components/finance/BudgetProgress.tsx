import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import { ProgressBar } from "../ui/ProgressBar";

export function BudgetProgress({ planned, actual }: { planned: number; actual: number }) {
  const usage = planned > 0 ? actual / planned : 0;
  const tone = usage > 1 ? "danger" : usage > 0.85 ? "warning" : "success";
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Usado</Text>
        <Text style={styles.value}>{money(actual)} de {money(planned)}</Text>
      </View>
      <ProgressBar value={usage} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  label: { color: theme.colors.muted, fontWeight: "800" },
  value: { color: theme.colors.text, fontWeight: "900" }
});

import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { calculateSettlement } from "../../lib/calculations";
import { money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function PersonSplitChart({ expenses }: { expenses: Expense[] }) {
  const settlement = calculateSettlement(expenses);
  const total = Math.max(settlement.totalPaidByPedro + settlement.totalPaidByCamilly, 1);
  return (
    <ChartCard title="Quem pagou o quê">
      <View style={styles.track}>
        <View style={[styles.pedro, { flex: settlement.totalPaidByPedro / total }]} />
        <View style={[styles.camilly, { flex: settlement.totalPaidByCamilly / total }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pedro {money(settlement.totalPaidByPedro)}</Text>
        <Text style={styles.label}>Camilly {money(settlement.totalPaidByCamilly)}</Text>
      </View>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", height: 28, borderRadius: theme.radius.pill, overflow: "hidden", backgroundColor: theme.colors.line },
  pedro: { backgroundColor: theme.colors.pedroStrong },
  camilly: { backgroundColor: theme.colors.camillyStrong },
  row: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  label: { color: theme.colors.text, fontWeight: "800" }
});

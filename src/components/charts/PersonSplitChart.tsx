import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { calculateSettlement } from "../../lib/calculations";
import { money } from "../../lib/formatters";
import type { Expense, Settlement } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function PersonSplitChart({ expenses, settlements = [], framed = true }: { expenses: Expense[]; settlements?: Settlement[]; framed?: boolean }) {
  const settlement = calculateSettlement(expenses, settlements);
  const total = Math.max(settlement.totalPaidByPedro + settlement.totalPaidByCamilly, 1);
  const pedroPercent = (settlement.totalPaidByPedro / total) * 100;
  const camillyPercent = (settlement.totalPaidByCamilly / total) * 100;
  const content = (
    <>
      <View style={styles.track}>
        <View style={[styles.pedro, { flex: settlement.totalPaidByPedro / total }]} />
        <View style={[styles.camilly, { flex: settlement.totalPaidByCamilly / total }]} />
      </View>
      <View style={styles.row}>
        <View style={styles.person}>
          <Text style={styles.name}>Pedro</Text>
          <Text style={styles.amount}>{money(settlement.totalPaidByPedro)}</Text>
          <Text style={styles.percent}>{pedroPercent.toFixed(1).replace(".", ",")}%</Text>
        </View>
        <View style={[styles.person, styles.personRight]}>
          <Text style={styles.name}>Camilly</Text>
          <Text style={styles.amount}>{money(settlement.totalPaidByCamilly)}</Text>
          <Text style={styles.percent}>{camillyPercent.toFixed(1).replace(".", ",")}%</Text>
        </View>
      </View>
    </>
  );

  if (!framed) return <View style={styles.embedded}>{content}</View>;

  return (
    <ChartCard title="Quem pagou o quê">
      {content}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  embedded: { gap: theme.spacing.md },
  track: {
    flexDirection: "row",
    height: 22,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: theme.colors.line,
    marginTop: 2
  },
  pedro: { backgroundColor: "#8B6CF7" },
  camilly: { backgroundColor: "#F34BA5" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md, marginTop: 12 },
  person: { flex: 1, gap: 3 },
  personRight: { alignItems: "flex-end" },
  name: { color: "#111827", fontWeight: "900", fontSize: 13 },
  amount: { color: "#111827", fontWeight: "900", fontSize: 17 },
  percent: { color: theme.colors.muted, fontWeight: "800", fontSize: 12 }
});

import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import type { Expense, Settlement } from "../../types/models";
import { calculateSettlement } from "../../lib/calculations";
import { money } from "../../lib/formatters";
import { Card } from "../ui/Card";

export function SettlementCard({ expenses, settlements = [] }: { expenses: Expense[]; settlements?: Settlement[] }) {
  const settlement = calculateSettlement(expenses, settlements);
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Divisão e acertos</Text>
      <Text style={styles.message}>{settlement.message}</Text>
      <View style={styles.grid}>
        <Text style={styles.meta}>Pago por Pedro: {money(settlement.totalPaidByPedro)}</Text>
        <Text style={styles.meta}>Pago por Camilly: {money(settlement.totalPaidByCamilly)}</Text>
        <Text style={styles.meta}>Responsabilidade Pedro: {money(settlement.pedroResponsibility)}</Text>
        <Text style={styles.meta}>Responsabilidade Camilly: {money(settlement.camillyResponsibility)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.couple },
  title: { color: theme.colors.text, fontSize: theme.typography.h2, fontWeight: "900" },
  message: { color: theme.colors.coupleStrong, fontSize: 18, fontWeight: "900" },
  grid: { gap: theme.spacing.xs },
  meta: { color: theme.colors.text, fontWeight: "700" }
});

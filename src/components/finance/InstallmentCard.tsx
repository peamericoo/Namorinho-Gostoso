import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { installmentStatus } from "../../lib/calculations";
import { dateBR, money, personName } from "../../lib/formatters";
import type { Installment } from "../../types/models";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

export function InstallmentCard({ installment }: { installment: Installment }) {
  const status = installmentStatus(installment);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{installment.description}</Text>
          <Text style={styles.meta}>{personName(installment.responsible_person)} · vence {dateBR(installment.due_date)}</Text>
        </View>
        <Badge label={status.overdue ? "Vencida" : status.dueSoon ? "Vence em breve" : installment.status} tone={status.overdue ? "danger" : status.dueSoon ? "warning" : "neutral"} />
      </View>
      <Text style={styles.amount}>{money(status.monthlyImpact)} por parcela</Text>
      <ProgressBar value={status.progress} tone={status.paid ? "success" : status.overdue ? "danger" : "couple"} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.line, gap: theme.spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.md },
  copy: { flex: 1 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  meta: { color: theme.colors.muted, marginTop: 3, fontWeight: "700" },
  amount: { color: theme.colors.text, fontWeight: "900" }
});

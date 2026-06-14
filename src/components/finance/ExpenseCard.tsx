import { StyleSheet, Text, View } from "react-native";
import { labelPerson, labelStatus } from "../../constants/categories";
import { theme } from "../../constants/theme";
import { dateBR, money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function ExpenseCard({
  expense,
  onPress
}: {
  expense: Expense;
  onPress?: () => void;
}) {
  return (
    <Card onPress={onPress} accessibilityLabel={`Abrir gasto ${expense.description}`}>
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text style={styles.title}>{expense.description}</Text>
          <Text style={styles.meta}>{dateBR(expense.spent_at)} · {expense.trip?.title ?? "Sem viagem"}</Text>
          <Text style={styles.meta}>{expense.category?.name ?? "Categoria"} · {labelStatus(expense.cost_type)}</Text>
        </View>
        <Text style={styles.amount}>{money(expense.amount)}</Text>
      </View>
      <View style={styles.badges}>
        <Badge label={`Pago por ${labelPerson(expense.paid_by_person)}`} tone={expense.paid_by_person === "pedro" ? "pedro" : "camilly"} />
        <Badge label={`Beneficiário ${labelPerson(expense.beneficiary_person)}`} tone={expense.beneficiary_person === "ambos" ? "couple" : expense.beneficiary_person === "pedro" ? "pedro" : "camilly"} />
        <Badge label={expense.should_split ? "Dividido" : "Individual"} tone={expense.should_split ? "success" : "neutral"} />
        {expense.payment_method ? <Badge label={expense.payment_method} tone="neutral" /> : null}
        {expense.is_reimbursable ? null : <Badge label="Não reembolsável" tone="warning" />}
        {expense.notes ? <Badge label="Com observação" tone="couple" /> : null}
        {expense.receipt_url ? <Badge label="Comprovante" tone="pedro" /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", gap: theme.spacing.md, justifyContent: "space-between" },
  copy: { flex: 1, gap: 3 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  amount: { color: theme.colors.text, fontWeight: "900", fontSize: 18 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }
});

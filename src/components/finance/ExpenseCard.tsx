import { Pressable, StyleSheet, Text, View } from "react-native";
import { labelPerson } from "../../constants/categories";
import { theme } from "../../constants/theme";
import { dateBR, money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { Badge } from "../ui/Badge";

export function ExpenseCard({ expense, onPress }: { expense: Expense; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{expense.description}</Text>
          <Text style={styles.meta}>{dateBR(expense.spent_at)} · Pago por {labelPerson(expense.paid_by_person)}</Text>
          <Text style={styles.meta}>{expense.category?.name ?? "Categoria"} · {expense.trip?.title ?? "Sem viagem"}</Text>
        </View>
        <Text style={styles.amount}>{money(expense.amount)}</Text>
      </View>
      <View style={styles.badges}>
        <Badge label={expense.should_split ? "Dividido" : "Individual"} tone={expense.should_split ? "success" : "neutral"} />
        {expense.receipt_url ? <Badge label="Comprovante" tone="pedro" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: theme.spacing.md
  },
  row: { flexDirection: "row", gap: theme.spacing.md, justifyContent: "space-between" },
  copy: { flex: 1, gap: 3 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  amount: { color: theme.colors.text, fontWeight: "900", fontSize: 18 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }
});

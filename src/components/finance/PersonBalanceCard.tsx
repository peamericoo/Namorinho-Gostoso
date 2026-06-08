import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";

export function PersonBalanceCard({ name, paid, responsibility, tone }: { name: string; paid: number; responsibility: number; tone: "pedro" | "camilly" }) {
  return (
    <View style={[styles.card, tone === "pedro" ? styles.pedro : styles.camilly]}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.amount}>{money(paid)}</Text>
      <Text style={styles.meta}>Responsabilidade: {money(responsibility)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: theme.radius.lg, padding: theme.spacing.lg, gap: theme.spacing.sm },
  pedro: { backgroundColor: theme.colors.pedro },
  camilly: { backgroundColor: theme.colors.camilly },
  name: { color: theme.colors.text, fontWeight: "900" },
  amount: { color: theme.colors.text, fontSize: 22, fontWeight: "900" },
  meta: { color: theme.colors.muted, fontWeight: "700" }
});

import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function KpiCard({ label, value, tone = "couple" }: { label: string; value: string; tone?: "pedro" | "camilly" | "couple" | "success" | "warning" }) {
  return (
    <View style={[styles.card, styles[tone]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 150,
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  pedro: { backgroundColor: theme.colors.pedro },
  camilly: { backgroundColor: theme.colors.camilly },
  couple: { backgroundColor: theme.colors.couple },
  success: { backgroundColor: theme.colors.success },
  warning: { backgroundColor: theme.colors.warning },
  label: {
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  value: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: theme.spacing.sm
  }
});

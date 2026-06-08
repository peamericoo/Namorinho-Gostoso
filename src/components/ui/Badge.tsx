import { StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" | "pedro" | "camilly" }) {
  return <Text style={[styles.badge, styles[tone]]}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "800"
  },
  neutral: { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.text },
  success: { backgroundColor: theme.colors.success, color: theme.colors.successStrong },
  warning: { backgroundColor: theme.colors.warning, color: theme.colors.warningStrong },
  danger: { backgroundColor: theme.colors.danger, color: theme.colors.dangerStrong },
  pedro: { backgroundColor: theme.colors.pedro, color: theme.colors.pedroStrong },
  camilly: { backgroundColor: theme.colors.camilly, color: theme.colors.camillyStrong }
});

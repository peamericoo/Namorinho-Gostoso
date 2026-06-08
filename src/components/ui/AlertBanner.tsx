import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function AlertBanner({ message, tone = "warning" }: { message: string; tone?: "warning" | "danger" | "success" }) {
  const textStyle = tone === "danger" ? styles.dangerText : tone === "success" ? styles.successText : styles.warningText;
  return (
    <View style={[styles.container, styles[tone]]}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1
  },
  warning: { backgroundColor: theme.colors.warning, borderColor: "#FBD38D" },
  danger: { backgroundColor: theme.colors.danger, borderColor: "#FECACA" },
  success: { backgroundColor: theme.colors.success, borderColor: "#BBF7D0" },
  text: { fontWeight: "800", lineHeight: 20 },
  warningText: { color: theme.colors.warningStrong },
  dangerText: { color: theme.colors.dangerStrong },
  successText: { color: theme.colors.successStrong }
});

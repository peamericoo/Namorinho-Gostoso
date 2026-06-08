import { StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";

export function MoneyText({ value, size = "md", tone = "default" }: { value: number; size?: "sm" | "md" | "lg"; tone?: "default" | "good" | "bad" }) {
  return <Text style={[styles.text, styles[size], tone === "good" && styles.good, tone === "bad" && styles.bad]}>{money(value)}</Text>;
}

const styles = StyleSheet.create({
  text: { color: theme.colors.text, fontWeight: "900" },
  sm: { fontSize: 14 },
  md: { fontSize: 18 },
  lg: { fontSize: 26 },
  good: { color: theme.colors.successStrong },
  bad: { color: theme.colors.dangerStrong }
});

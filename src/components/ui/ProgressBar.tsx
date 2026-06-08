import { StyleSheet, View, type DimensionValue } from "react-native";
import { theme } from "../../constants/theme";

export function ProgressBar({ value, tone = "couple" }: { value: number; tone?: "couple" | "success" | "warning" | "danger" }) {
  const width = `${Math.max(0, Math.min(100, value * 100))}%` as DimensionValue;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, styles[tone], { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.line,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill
  },
  couple: { backgroundColor: theme.colors.coupleStrong },
  success: { backgroundColor: theme.colors.successStrong },
  warning: { backgroundColor: theme.colors.warningStrong },
  danger: { backgroundColor: theme.colors.dangerStrong }
});

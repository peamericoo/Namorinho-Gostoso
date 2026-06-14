import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

type Metric = {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "pedro" | "camilly" | "couple" | "success" | "warning" | "danger";
};

export function AnalyticsMetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <Card>
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={[styles.metric, metric.tone && metric.tone !== "neutral" && styles[metric.tone]]}>
            <Text style={styles.label}>{metric.label}</Text>
            <Text style={styles.value}>{metric.value}</Text>
            {metric.helper ? <Text style={styles.helper} numberOfLines={2}>{metric.helper}</Text> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metric: {
    flex: 1,
    minWidth: 152,
    minHeight: 108,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    padding: theme.spacing.md,
    gap: 3,
    justifyContent: "center"
  },
  pedro: { backgroundColor: theme.colors.pedro },
  camilly: { backgroundColor: theme.colors.camilly },
  couple: { backgroundColor: theme.colors.couple },
  success: { backgroundColor: theme.colors.success },
  warning: { backgroundColor: theme.colors.warning },
  danger: { backgroundColor: theme.colors.danger },
  label: {
    color: theme.colors.muted,
    fontWeight: "900",
    fontSize: theme.typography.small,
    textTransform: "uppercase"
  },
  value: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 22
  },
  helper: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small,
    lineHeight: 16
  }
});

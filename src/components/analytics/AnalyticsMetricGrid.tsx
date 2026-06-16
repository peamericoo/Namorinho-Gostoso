import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

type Metric = {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "pedro" | "camilly" | "couple" | "success" | "warning" | "danger";
  Icon?: LucideIcon;
};

export function AnalyticsMetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => {
        const tone = metric.tone ?? "neutral";
        const Icon = metric.Icon;
        return (
          <View key={metric.label} style={[styles.metric, styles[`${tone}Metric`]]}>
            <Text style={[styles.label, styles[`${tone}Label`]]}>{metric.label}</Text>
            <Text style={styles.value} numberOfLines={1}>{metric.value}</Text>
            {metric.helper ? <Text style={styles.helper} numberOfLines={2}>{metric.helper}</Text> : null}
            {Icon ? (
              <View style={[styles.iconShell, styles[`${tone}Icon`]]}>
                <Icon color={toneColors[tone]} size={31} strokeWidth={2.35} />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const toneColors = {
  neutral: "#64748B",
  pedro: "#38A8E8",
  camilly: "#F973A8",
  couple: "#7C5CF6",
  success: "#25A46A",
  warning: "#B7791F",
  danger: "#FF3F5F"
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18
  },
  metric: {
    flex: 1,
    minWidth: 230,
    minHeight: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 22,
    paddingRight: 78,
    gap: 6,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    ...theme.shadow
  },
  neutralMetric: { backgroundColor: "#FFFFFF" },
  pedroMetric: { backgroundColor: "#EEF9FF", borderColor: "#D9F0FF" },
  camillyMetric: { backgroundColor: "#FFF2F8", borderColor: "#FFE0EE" },
  coupleMetric: { backgroundColor: "#F4EDFF", borderColor: "#E4D7FF" },
  successMetric: { backgroundColor: "#EDFFF6", borderColor: "#D4F4E1" },
  warningMetric: { backgroundColor: "#FFF8E8", borderColor: "#F5E3B8" },
  dangerMetric: { backgroundColor: "#FFF0F2", borderColor: "#FFD7DF" },
  iconShell: {
    position: "absolute",
    right: 18,
    top: 36,
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  neutralIcon: { backgroundColor: "#F1F5F9" },
  pedroIcon: { backgroundColor: "#DDF3FF" },
  camillyIcon: { backgroundColor: "#FFE4F0" },
  coupleIcon: { backgroundColor: "#E9DCFF" },
  successIcon: { backgroundColor: "#DDF8EA" },
  warningIcon: { backgroundColor: "#FFF0C9" },
  dangerIcon: { backgroundColor: "#FFE1E8" },
  label: {
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase"
  },
  neutralLabel: { color: "#64748B" },
  pedroLabel: { color: "#167CB4" },
  camillyLabel: { color: "#D33881" },
  coupleLabel: { color: "#6F4EEB" },
  successLabel: { color: "#158A52" },
  warningLabel: { color: "#A96D17" },
  dangerLabel: { color: "#FF3F5F" },
  value: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 31
  },
  helper: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small,
    lineHeight: 17
  }
});

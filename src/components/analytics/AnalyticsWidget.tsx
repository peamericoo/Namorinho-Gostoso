import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

export function AnalyticsWidget({
  title,
  subtitle,
  right,
  children,
  variant = "default",
  style
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  variant?: "default" | "filter";
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <Card style={[styles.card, variant === "filter" && styles.filterCard, style]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 0,
    borderRadius: 20,
    padding: 22,
    gap: theme.spacing.lg
  },
  filterCard: {
    paddingTop: 20,
    paddingBottom: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  copy: {
    flex: 1
  },
  title: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 17,
    lineHeight: 23
  },
  subtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17
  },
  right: {
    alignItems: "flex-end"
  }
});

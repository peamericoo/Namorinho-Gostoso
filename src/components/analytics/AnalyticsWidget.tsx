import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

export function AnalyticsWidget({
  title,
  subtitle,
  right,
  children
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.card}>
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
    minHeight: 0
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
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h2
  },
  subtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 19
  },
  right: {
    alignItems: "flex-end"
  }
});

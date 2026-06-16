import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

export function ChartCard({
  title,
  subtitle,
  empty,
  minHeight,
  children
}: {
  title: string;
  subtitle?: string;
  empty?: string;
  minHeight?: number;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.body, minHeight ? { minHeight } : null]}>{children}</View>
      {empty ? <Text style={styles.empty}>{empty}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 282,
    borderRadius: 20,
    padding: 22,
    gap: theme.spacing.lg
  },
  title: { color: "#111827", fontWeight: "900", fontSize: 16, lineHeight: 22 },
  subtitle: { color: theme.colors.muted, fontWeight: "700", marginTop: 2, lineHeight: 18, fontSize: 12 },
  body: { gap: theme.spacing.md },
  empty: { color: theme.colors.muted, fontWeight: "700", lineHeight: 20 }
});

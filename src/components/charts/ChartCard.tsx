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
    <Card>
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
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  subtitle: { color: theme.colors.muted, fontWeight: "700", marginTop: 2, lineHeight: 19 },
  body: { gap: theme.spacing.sm },
  empty: { color: theme.colors.muted, fontWeight: "700", lineHeight: 20 }
});

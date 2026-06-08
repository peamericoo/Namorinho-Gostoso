import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Card } from "../ui/Card";

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  body: { gap: theme.spacing.sm }
});

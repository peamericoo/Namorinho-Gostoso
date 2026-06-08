import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  copy: {
    flex: 1
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: "800",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 21
  }
});

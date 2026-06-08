import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "900"
  }
});

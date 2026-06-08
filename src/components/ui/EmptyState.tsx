import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Button } from "./Button";

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h2,
    textAlign: "center"
  },
  message: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    textAlign: "center",
    lineHeight: 22
  }
});

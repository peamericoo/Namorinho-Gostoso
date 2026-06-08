import { StyleSheet, View, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    gap: theme.spacing.md,
    ...theme.shadow
  }
});

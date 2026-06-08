import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "../../constants/theme";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Button({ title, onPress, variant = "primary", disabled, loading, style, accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.base, styles[variant], (pressed || disabled) && styles.pressed, style]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? "#fff" : theme.colors.coupleStrong} /> : <Text style={[styles.text, variant !== "primary" && styles.textAlt]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: theme.colors.coupleStrong
  },
  secondary: {
    backgroundColor: theme.colors.couple,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: theme.colors.danger
  },
  pressed: {
    opacity: 0.72
  },
  text: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  textAlt: {
    color: theme.colors.text
  }
});

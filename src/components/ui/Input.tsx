import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { theme } from "../../constants/theme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, error && styles.errorInput, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.typography.body
  },
  errorInput: {
    borderColor: theme.colors.dangerStrong,
    backgroundColor: theme.colors.danger
  },
  error: {
    color: theme.colors.dangerStrong,
    fontSize: theme.typography.small,
    fontWeight: "700"
  }
});

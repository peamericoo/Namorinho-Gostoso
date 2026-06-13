import { useState } from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { theme } from "../../constants/theme";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
};

export function Input({ label, error, helperText, required, style, onBlur, onFocus, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, focused && styles.focused, error && styles.errorInput, style]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={props.accessibilityHint ?? (required ? "Campo obrigatório" : undefined)}
        accessibilityState={{ disabled: props.editable === false }}
        {...props}
      />
      {helperText && !error ? <Text style={styles.helper}>{helperText}</Text> : null}
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
  required: {
    color: theme.colors.dangerStrong
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600"
  },
  focused: {
    borderColor: theme.colors.coupleStrong,
    backgroundColor: theme.colors.surface
  },
  errorInput: {
    borderColor: theme.colors.dangerStrong,
    backgroundColor: theme.colors.danger
  },
  helper: {
    color: theme.colors.muted,
    fontSize: theme.typography.small,
    lineHeight: 17
  },
  error: {
    color: theme.colors.dangerStrong,
    fontSize: theme.typography.small,
    fontWeight: "700"
  }
});

import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function Select({
  label,
  value,
  options,
  onChange,
  error
}: {
  label: string;
  value?: string | null;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error && styles.errorInput]}>
        <Picker selectedValue={value ?? ""} onValueChange={(next) => onChange(String(next))} style={styles.picker}>
          <Picker.Item label="Selecione" value="" />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
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
  box: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.input,
    overflow: "hidden"
  },
  picker: {
    minHeight: 48,
    color: theme.colors.text
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

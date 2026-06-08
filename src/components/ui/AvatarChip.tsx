import { StyleSheet, Text, View } from "react-native";
import { personName } from "../../lib/formatters";
import type { PersonKey } from "../../types/models";
import { theme } from "../../constants/theme";

export function AvatarChip({ person }: { person: PersonKey | string }) {
  const label = personName(person);
  return (
    <View style={[styles.chip, person === "pedro" ? styles.pedro : person === "camilly" ? styles.camilly : styles.ambos]}>
      <Text style={styles.avatar}>{label.slice(0, 1)}</Text>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill
  },
  pedro: { backgroundColor: theme.colors.pedro },
  camilly: { backgroundColor: theme.colors.camilly },
  ambos: { backgroundColor: theme.colors.couple },
  avatar: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  text: {
    color: theme.colors.text,
    fontWeight: "800"
  }
});

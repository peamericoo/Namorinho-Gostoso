import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export function FloatingActionButton({ onPress, label = "Adicionar" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.button}>
      <Plus color="#fff" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.coupleStrong,
    ...theme.shadow
  }
});

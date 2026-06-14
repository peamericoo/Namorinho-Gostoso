import { Bell } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function NotificationBell({ count, onPress }: { count: number; onPress: () => void }) {
  const displayCount = count > 9 ? "9+" : String(count);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Abrir ${count} notificações` : "Abrir notificações"}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Bell color={theme.colors.coupleStrong} size={21} strokeWidth={2.5} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    position: "relative"
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }]
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: theme.colors.dangerStrong,
    borderWidth: 2,
    borderColor: theme.colors.surface
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12
  }
});

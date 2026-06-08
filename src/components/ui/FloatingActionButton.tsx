import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export function FloatingActionButton({ onPress, label = "Adicionar" }: { onPress: () => void; label?: string }) {
  const scale = useState(() => new Animated.Value(1))[0];

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      speed: 30,
      bounciness: 8,
      useNativeDriver: true
    }).start();
  }

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={() => animate(0.93)}
        onPressOut={() => animate(1)}
        onHoverIn={() => animate(1.06)}
        onHoverOut={() => animate(1)}
        style={styles.button}
      >
        <Plus color="#fff" size={26} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    ...theme.shadow
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.coupleStrong
  }
});

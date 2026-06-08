import { useState } from "react";
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  const scale = useState(() => new Animated.Value(1))[0];
  const lift = useState(() => new Animated.Value(0))[0];

  function animate(toScale: number, toLift: number) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        speed: 26,
        bounciness: 6,
        useNativeDriver: true
      }),
      Animated.timing(lift, {
        toValue: toLift,
        duration: theme.transition.fast,
        useNativeDriver: true
      })
    ]).start();
  }

  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Animated.View
      style={{
        transform: [
          { scale },
          {
            translateY: lift.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -3]
            })
          }
        ]
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => animate(0.985, 0)}
        onPressOut={() => animate(1, 0)}
        onHoverIn={() => animate(1.008, 1)}
        onHoverOut={() => animate(1, 0)}
        style={({ pressed }) => [styles.card, styles.interactive, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
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
  },
  interactive: {
    cursor: "pointer"
  },
  pressed: {
    borderColor: theme.colors.focusRing
  }
});

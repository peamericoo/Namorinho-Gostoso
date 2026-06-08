import { useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
};

export function Button({ title, onPress, variant = "primary", disabled, loading, style, accessibilityLabel, icon, size = "md" }: ButtonProps) {
  const isDisabled = disabled || loading;
  const [focused, setFocused] = useState(false);
  const scale = useState(() => new Animated.Value(1))[0];
  const lift = useState(() => new Animated.Value(0))[0];

  function animate(toScale: number, toLift: number) {
    if (isDisabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        speed: 28,
        bounciness: 7,
        useNativeDriver: true
      }),
      Animated.timing(lift, {
        toValue: toLift,
        duration: theme.transition.fast,
        useNativeDriver: true
      })
    ]).start();
  }

  return (
    <Animated.View
      style={[
        styles.animatedWrap,
        {
          transform: [
            { scale },
            {
              translateY: lift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2]
              })
            }
          ]
        },
        style
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        onPress={onPress}
        onPressIn={() => animate(0.97, 0)}
        onPressOut={() => animate(1, 0)}
        onHoverIn={() => animate(1.012, 1)}
        onHoverOut={() => animate(1, 0)}
        onFocus={() => {
          setFocused(true);
          animate(1.012, 1);
        }}
        onBlur={() => {
          setFocused(false);
          animate(1, 0);
        }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles[size],
          styles[variant],
          focused && styles.focused,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#fff" : theme.colors.coupleStrong} />
        ) : (
          <View style={styles.content}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[styles.text, variant !== "primary" && styles.textAlt, variant === "danger" && styles.textDanger]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedWrap: {
  },
  base: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent"
  },
  sm: {
    minHeight: 40,
    paddingHorizontal: theme.spacing.md
  },
  md: {
    minHeight: 48
  },
  primary: {
    backgroundColor: theme.colors.coupleStrong,
    borderColor: theme.colors.coupleStrong
  },
  secondary: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.lineStrong
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: "#FDBA74"
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.86
  },
  focused: {
    borderColor: theme.colors.focusRing
  },
  disabled: {
    opacity: 0.52
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    maxWidth: "100%"
  },
  icon: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  textAlt: {
    color: theme.colors.text
  },
  textDanger: {
    color: theme.colors.dangerStrong
  }
});

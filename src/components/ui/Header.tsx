import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function Header({
  title,
  subtitle,
  right,
  back,
  onBack,
  backLabel = "Voltar"
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  backLabel?: string;
}) {
  const [backFocused, setBackFocused] = useState(false);
  const scale = useState(() => new Animated.Value(1))[0];

  function animateBack(toValue: number) {
    Animated.spring(scale, {
      toValue,
      speed: 30,
      bounciness: 7,
      useNativeDriver: true
    }).start();
  }

  return (
    <View style={styles.container}>
      {back ? (
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))}
            onPressIn={() => animateBack(0.94)}
            onPressOut={() => animateBack(1)}
            onHoverIn={() => animateBack(1.05)}
            onHoverOut={() => animateBack(1)}
            onFocus={() => {
              setBackFocused(true);
              animateBack(1.05);
            }}
            onBlur={() => {
              setBackFocused(false);
              animateBack(1);
            }}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed, backFocused && styles.backFocused]}
          >
            <ChevronLeft color={theme.colors.text} size={20} />
          </Pressable>
        </Animated.View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.actions}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    minHeight: 56
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  backPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  backFocused: {
    borderColor: theme.colors.focusRing
  },
  copy: {
    flex: 1,
    paddingTop: 2
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 34
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 21
  },
  actions: {
    minHeight: 40,
    alignItems: "flex-end",
    justifyContent: "center"
  }
});

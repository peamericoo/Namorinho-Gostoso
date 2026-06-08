import { useEffect, useRef } from "react";
import { Animated, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appMaxWidth, theme } from "../../constants/theme";
import { AppBackdrop } from "./AppBackdrop";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, scroll = true, refreshing = false, onRefresh }: ScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.transition.base,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY]);

  const content = (
    <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <AppBackdrop />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
            contentContainerStyle={styles.scroll}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.appBackground
  },
  keyboard: {
    flex: 1,
    zIndex: 1
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: theme.spacing.xxl
  },
  content: {
    width: "100%",
    maxWidth: appMaxWidth,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg
  }
});

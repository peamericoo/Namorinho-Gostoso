import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appMaxWidth, theme } from "../../constants/theme";

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, scroll = true, refreshing = false, onRefresh }: ScreenProps) {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
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
    flex: 1
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

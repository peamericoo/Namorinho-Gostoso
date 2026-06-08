import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "../src/constants/theme";
import { useAuth } from "../src/hooks/useAuth";
import { useWorkspace } from "../src/hooks/useWorkspace";

export default function Index() {
  const auth = useAuth();
  const workspace = useWorkspace();

  if (auth.isLoading || (auth.user && workspace.isLoading)) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={theme.colors.coupleStrong} />
        <Text style={styles.text}>Carregando seu plano a dois...</Text>
      </View>
    );
  }

  if (!auth.user) return <Redirect href="/auth/login" />;
  if (!workspace.data?.profile || !workspace.data?.couple) return <Redirect href="/auth/profile-setup" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.appBackground
  },
  text: {
    color: theme.colors.text,
    fontWeight: "800"
  }
});

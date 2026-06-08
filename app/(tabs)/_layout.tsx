import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { BarChart3, Calculator, CircleDollarSign, Map, MoreHorizontal } from "lucide-react-native";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useWorkspace } from "../../src/hooks/useWorkspace";

export default function TabsLayout() {
  const auth = useAuth();
  const workspace = useWorkspace();

  if (auth.isLoading || workspace.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.appBackground }}>
        <ActivityIndicator color={theme.colors.coupleStrong} />
      </View>
    );
  }

  if (!auth.user) return <Redirect href="/auth/login" />;
  if (!workspace.data?.profile || !workspace.data?.couple) return <Redirect href="/auth/profile-setup" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.coupleStrong,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.line,
          minHeight: 68,
          paddingTop: 8
        },
        tabBarLabelStyle: { fontWeight: "800" }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Painel", tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
      <Tabs.Screen name="trips" options={{ title: "Viagens", tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }} />
      <Tabs.Screen name="expenses" options={{ title: "Gastos", tabBarIcon: ({ color, size }) => <CircleDollarSign color={color} size={size} /> }} />
      <Tabs.Screen name="simulator" options={{ title: "Simulador", tabBarIcon: ({ color, size }) => <Calculator color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: "Mais", tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }} />
    </Tabs>
  );
}

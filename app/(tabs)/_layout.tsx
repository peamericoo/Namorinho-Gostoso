import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { BarChart3, Calculator, CircleDollarSign, Map, MoreHorizontal } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useWorkspace } from "../../src/hooks/useWorkspace";

const BASE_TAB_BAR_HEIGHT = 64;
const MIN_TAB_BAR_BOTTOM_PADDING = 8;
const TAB_BAR_TOP_PADDING = 8;

export default function TabsLayout() {
  const auth = useAuth();
  const workspace = useWorkspace();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, MIN_TAB_BAR_BOTTOM_PADDING);
  const tabBarHeight = BASE_TAB_BAR_HEIGHT + bottomPadding;

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
          borderTopWidth: 1,
          height: tabBarHeight,
          minHeight: tabBarHeight,
          paddingTop: TAB_BAR_TOP_PADDING,
          paddingBottom: bottomPadding,
          overflow: "visible"
        },
        tabBarItemStyle: {
          borderRadius: theme.radius.md,
          marginHorizontal: 3,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 4,
          paddingBottom: 2
        },
        tabBarIconStyle: { marginTop: 0, marginBottom: 1 },
        tabBarLabelStyle: {
          fontWeight: "800",
          fontSize: 11,
          lineHeight: 14,
          marginTop: 0,
          marginBottom: 0,
          includeFontPadding: false
        },
        tabBarHideOnKeyboard: true
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

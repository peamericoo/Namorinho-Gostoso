import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { BarChart3, Calculator, CircleDollarSign, Map, MoreHorizontal, type LucideIcon } from "lucide-react-native";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useWorkspace } from "../../src/hooks/useWorkspace";

const BASE_TAB_BAR_HEIGHT = 64;

function TabIcon({ Icon, color, focused, size }: { Icon: LucideIcon; color: string; focused: boolean; size: number }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Icon color={color} size={focused ? size + 2 : size} strokeWidth={focused ? 2.8 : 2.35} />
    </View>
  );
}

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
        tabBarActiveBackgroundColor: theme.colors.couple,
        tabBarInactiveBackgroundColor: "transparent",
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.line,
          borderTopWidth: 1,
          height: BASE_TAB_BAR_HEIGHT,
          minHeight: BASE_TAB_BAR_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "visible",
          ...styles.tabBarDepth
        },
        tabBarItemStyle: {
          borderRadius: theme.radius.md,
          marginHorizontal: 4,
          marginTop: 6,
          marginBottom: 6,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "hidden"
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Painel",
          tabBarActiveTintColor: theme.colors.coupleStrong,
          tabBarActiveBackgroundColor: theme.colors.couple,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={BarChart3} color={color} focused={focused} size={size} />
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Viagens",
          tabBarActiveTintColor: theme.colors.pedroStrong,
          tabBarActiveBackgroundColor: theme.colors.pedro,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={Map} color={color} focused={focused} size={size} />
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Gastos",
          tabBarActiveTintColor: theme.colors.successStrong,
          tabBarActiveBackgroundColor: theme.colors.success,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={CircleDollarSign} color={color} focused={focused} size={size} />
        }}
      />
      <Tabs.Screen
        name="simulator"
        options={{
          title: "Simulador",
          tabBarActiveTintColor: theme.colors.warningStrong,
          tabBarActiveBackgroundColor: theme.colors.warning,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={Calculator} color={color} focused={focused} size={size} />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarActiveTintColor: theme.colors.camillyStrong,
          tabBarActiveBackgroundColor: theme.colors.camilly,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={MoreHorizontal} color={color} focused={focused} size={size} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarDepth: Platform.select({
    web: {
      boxShadow: "0 -10px 24px rgba(71, 85, 105, 0.08)"
    },
    default: {
      shadowColor: "#334155",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: -4 },
      elevation: 10
    }
  }),
  iconPill: {
    width: 34,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 1 }]
  },
  iconPillActive: {
    transform: [{ scale: 1.04 }]
  }
});

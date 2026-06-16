import { Redirect, Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Platform, StyleSheet, View } from "react-native";
import { BarChart3, Calculator, CircleDollarSign, Home, Map, MoreHorizontal, type LucideIcon } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { useWorkspace } from "../../src/hooks/useWorkspace";

const BASE_TAB_BAR_HEIGHT = 62;
const WAVE_VIEWBOX_WIDTH = 390;
const WAVE_VIEWBOX_HEIGHT = 88;

function buildWavePath({ amplitude, baseline, phase }: { amplitude: number; baseline: number; phase: number }) {
  const points = Array.from({ length: 17 }, (_, index) => {
    const x = (WAVE_VIEWBOX_WIDTH / 16) * index;
    const primary = Math.sin((x / WAVE_VIEWBOX_WIDTH) * Math.PI * 2 + phase) * amplitude;
    const secondary = Math.sin((x / WAVE_VIEWBOX_WIDTH) * Math.PI * 4 + phase * 0.55) * (amplitude * 0.26);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${(baseline + primary + secondary).toFixed(1)}`;
  });

  return `${points.join(" ")} L ${WAVE_VIEWBOX_WIDTH} ${WAVE_VIEWBOX_HEIGHT} L 0 ${WAVE_VIEWBOX_HEIGHT} Z`;
}

const tabWaveSurface = buildWavePath({ amplitude: 7.2, baseline: 24, phase: 0.28 });
const tabWaveGlow = buildWavePath({ amplitude: 6.5, baseline: 20, phase: 1.15 });
const tabWaveStroke = buildWavePath({ amplitude: 7.2, baseline: 24, phase: 0.28 }).split(" L 390 88")[0];

function TabIcon({ Icon, color, focused, size }: { Icon: LucideIcon; color: string; focused: boolean; size: number }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Icon color={color} size={focused ? size + 2 : size} strokeWidth={focused ? 2.8 : 2.35} />
    </View>
  );
}

function ActiveTabLabel({ focused, color, label }: { focused: boolean; color: string; label: string }) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: theme.transition.base,
      useNativeDriver: false
    }).start();
  }, [focused, progress]);

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        styles.tabLabel,
        {
          color,
          opacity: progress,
          maxWidth: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 82] }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [3, 0] }) }]
        }
      ]}
    >
      {label}
    </Animated.Text>
  );
}

function AnimatedTabBarBackground() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 5200,
          useNativeDriver: false
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 5200,
          useNativeDriver: false
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  const glowOpacity = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.34, 0.52, 0.34] });

  return (
    <View style={styles.waveHost}>
      <Animated.View style={[styles.waveGlow, { opacity: glowOpacity, transform: [{ translateX }] }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} ${WAVE_VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
          <Path d={tabWaveGlow} fill={theme.colors.couple} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waveSurface, { transform: [{ translateY }] }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${WAVE_VIEWBOX_WIDTH} ${WAVE_VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
          <Path d={tabWaveSurface} fill={theme.colors.surface} />
          <Path d={tabWaveStroke} fill="none" stroke={theme.colors.line} strokeWidth={1.2} opacity={0.9} />
        </Svg>
      </Animated.View>
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
        tabBarBackground: () => <AnimatedTabBarBackground />,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "transparent",
          borderTopWidth: 0,
          height: BASE_TAB_BAR_HEIGHT,
          minHeight: BASE_TAB_BAR_HEIGHT,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "visible",
          ...styles.tabBarDepth
        },
        tabBarItemStyle: {
          borderRadius: theme.radius.pill,
          marginHorizontal: 2,
          marginTop: 6,
          marginBottom: 6,
          minWidth: 44,
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
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={Home} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Painel" />
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Análises",
          tabBarActiveTintColor: theme.colors.coupleStrong,
          tabBarActiveBackgroundColor: theme.colors.couple,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={BarChart3} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Análises" />
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Viagens",
          tabBarActiveTintColor: theme.colors.pedroStrong,
          tabBarActiveBackgroundColor: theme.colors.pedro,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={Map} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Viagens" />
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Gastos",
          tabBarActiveTintColor: theme.colors.successStrong,
          tabBarActiveBackgroundColor: theme.colors.success,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={CircleDollarSign} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Gastos" />
        }}
      />
      <Tabs.Screen
        name="simulator"
        options={{
          title: "Simulador",
          tabBarActiveTintColor: theme.colors.warningStrong,
          tabBarActiveBackgroundColor: theme.colors.warning,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={Calculator} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Simular" />
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",
          tabBarActiveTintColor: theme.colors.camillyStrong,
          tabBarActiveBackgroundColor: theme.colors.camilly,
          tabBarIcon: ({ color, focused, size }) => <TabIcon Icon={MoreHorizontal} color={color} focused={focused} size={size} />,
          tabBarLabel: ({ focused, color }) => <ActiveTabLabel focused={focused} color={color} label="Mais" />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  waveHost: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -22,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none"
  },
  waveGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  waveSurface: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 2,
    bottom: 0
  },
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
  },
  tabLabel: {
    fontWeight: "900",
    fontSize: 11,
    lineHeight: 14,
    includeFontPadding: false,
    overflow: "hidden"
  }
});

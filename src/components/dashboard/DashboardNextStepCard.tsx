import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { theme } from "../../constants/theme";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export type DashboardNextAction = {
  eyebrow: string;
  title: string;
  message: string;
  action: string;
  route: string;
};

type DashboardNextStepCardProps = {
  action: DashboardNextAction;
  style?: StyleProp<ViewStyle>;
};

export function DashboardNextStepCard({ action, style }: DashboardNextStepCardProps) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [float]);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.inner}>
        <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) }] }}>
          <TravelIllustration />
        </Animated.View>
        <Text style={styles.eyebrow}>{action.eyebrow}</Text>
        <Text style={styles.title}>{action.title}</Text>
        <Text style={styles.message}>{action.message}</Text>
        <Button title={action.action} onPress={() => router.push(action.route as never)} style={styles.button} buttonStyle={styles.primaryButton} textStyle={styles.primaryButtonText} />
      </View>
    </Card>
  );
}

function TravelIllustration() {
  return (
    <Svg width={186} height={118} viewBox="0 0 186 118" fill="none">
      <Path d="M26 66 C42 44 63 43 74 54 C87 31 111 29 123 47 C137 43 150 49 157 66" stroke="#FFD5DC" strokeWidth={5} strokeLinecap="round" />
      <Path d="M20 72 C38 51 45 38 53 26 C60 43 57 60 45 76" fill="#FF8EA0" opacity={0.9} />
      <Path d="M30 70 C22 51 25 38 32 28 C45 43 47 57 38 75" fill="#FF617C" opacity={0.86} />
      <Path d="M40 70 C39 50 48 35 60 27 C66 46 59 61 47 78" fill="#FFB7C2" opacity={0.85} />
      <Rect x={73} y={34} width={48} height={60} rx={10} fill="#FF5A73" />
      <Rect x={82} y={24} width={30} height={14} rx={4} stroke="#1F2937" strokeWidth={5} />
      <Path d="M86 43 V84" stroke="#E94761" strokeWidth={4} strokeLinecap="round" />
      <Path d="M99 43 V84" stroke="#E94761" strokeWidth={4} strokeLinecap="round" />
      <Path d="M112 43 V84" stroke="#E94761" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={84} cy={98} r={5} fill="#475569" />
      <Circle cx={112} cy={98} r={5} fill="#475569" />
      <Path d="M131 57 C142 43 154 44 164 57" stroke="#FFB7C2" strokeWidth={5} strokeLinecap="round" />
      <Path d="M137 57 H171" stroke="#FFB7C2" strokeWidth={5} strokeLinecap="round" />
      <Path d="M17 82 H169" stroke="#FFDCE2" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={150} cy={42} r={5} fill="#FFD3DA" />
      <Circle cx={34} cy={23} r={4} fill="#FFD3DA" />
    </Svg>
  );
}

const palette = {
  primary: "#FF3F5F",
  ink: "#111827"
};

const styles = StyleSheet.create({
  card: {
    padding: 12
  },
  inner: {
    minHeight: 320,
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFF3F5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 26,
    gap: theme.spacing.sm
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2
  },
  title: {
    color: palette.ink,
    fontSize: theme.typography.h2,
    lineHeight: 25,
    fontWeight: "900",
    textAlign: "center"
  },
  message: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 310
  },
  button: {
    alignSelf: "stretch",
    marginTop: theme.spacing.sm
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "900"
  }
});

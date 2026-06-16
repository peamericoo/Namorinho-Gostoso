import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { theme } from "../../constants/theme";

const VIEWBOX_WIDTH = 390;
const VIEWBOX_HEIGHT = 844;

type LinePath = {
  d: string;
  color: string;
  opacity: number;
  width: number;
  dash?: string;
};

function buildSinePath({ y, amplitude, frequency, phase, tilt = 0 }: { y: number; amplitude: number; frequency: number; phase: number; tilt?: number }) {
  const segments = 10;
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const x = (VIEWBOX_WIDTH / segments) * index;
    const wave = Math.sin((index / segments) * Math.PI * frequency + phase) * amplitude;
    const secondary = Math.sin((index / segments) * Math.PI * frequency * 1.8 + phase * 0.7) * (amplitude * 0.28);
    return { x, y: y + wave + secondary + (index - segments / 2) * tilt };
  });

  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      const previous = points[index - 1];
      const controlX = previous.x + (point.x - previous.x) / 2;
      return `C ${controlX.toFixed(1)} ${previous.y.toFixed(1)}, ${controlX.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");
}

function buildContourLoop({ cx, cy, rx, ry, wobble, phase }: { cx: number; cy: number; rx: number; ry: number; wobble: number; phase: number }) {
  const samples = 16;
  const points = Array.from({ length: samples }, (_, index) => {
    const angle = (Math.PI * 2 * index) / samples;
    const radiusNoise = 1 + Math.sin(angle * 3 + phase) * wobble + Math.cos(angle * 5 - phase) * wobble * 0.38;
    return {
      x: cx + Math.cos(angle) * rx * radiusNoise,
      y: cy + Math.sin(angle) * ry * radiusNoise
    };
  });

  return `${points
    .map((point, index) => {
      const next = points[(index + 1) % points.length];
      const controlX = (point.x + next.x) / 2;
      const controlY = (point.y + next.y) / 2;
      return `${index === 0 ? `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}` : ""} Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} ${controlX.toFixed(1)} ${controlY.toFixed(1)}`;
    })
    .join(" ")} Z`;
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

const atlasLines: LinePath[] = [
  { d: buildSinePath({ y: 92, amplitude: 18, frequency: 2.1, phase: 0.2, tilt: -0.4 }), color: theme.colors.pedroStrong, opacity: 0.08, width: 1.25 },
  { d: buildSinePath({ y: 128, amplitude: 22, frequency: 2.3, phase: 1.1, tilt: -0.22 }), color: theme.colors.camillyStrong, opacity: 0.09, width: 1.2 },
  { d: buildSinePath({ y: 300, amplitude: 16, frequency: 2.7, phase: 0.6, tilt: 0.32 }), color: theme.colors.coupleStrong, opacity: 0.075, width: 1.2 },
  { d: buildSinePath({ y: 520, amplitude: 25, frequency: 2.15, phase: 2.2, tilt: -0.2 }), color: theme.colors.successStrong, opacity: 0.07, width: 1.1 },
  { d: buildSinePath({ y: 705, amplitude: 26, frequency: 2.45, phase: 1.7, tilt: 0.18 }), color: theme.colors.warningStrong, opacity: 0.07, width: 1.1 }
];

const contourLines: LinePath[] = [
  { d: buildContourLoop({ cx: 70, cy: 186, rx: 56, ry: 34, wobble: 0.1, phase: 0.3 }), color: theme.colors.coupleStrong, opacity: 0.085, width: 1.2 },
  { d: buildContourLoop({ cx: 70, cy: 186, rx: 36, ry: 22, wobble: 0.12, phase: 1.2 }), color: theme.colors.coupleStrong, opacity: 0.07, width: 1.05 },
  { d: buildContourLoop({ cx: 332, cy: 118, rx: 64, ry: 42, wobble: 0.09, phase: 2.5 }), color: theme.colors.camillyStrong, opacity: 0.09, width: 1.2 },
  { d: buildContourLoop({ cx: 332, cy: 118, rx: 40, ry: 26, wobble: 0.11, phase: 3.1 }), color: theme.colors.camillyStrong, opacity: 0.075, width: 1.05 },
  { d: buildContourLoop({ cx: 304, cy: 698, rx: 72, ry: 46, wobble: 0.1, phase: 1.8 }), color: theme.colors.pedroStrong, opacity: 0.08, width: 1.15 },
  { d: buildContourLoop({ cx: 304, cy: 698, rx: 46, ry: 29, wobble: 0.12, phase: 0.7 }), color: theme.colors.pedroStrong, opacity: 0.065, width: 1 }
];

export function AppBackdrop() {
  const { width, height } = useWindowDimensions();
  const drift = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const adaptiveViewBoxWidth = Math.max(VIEWBOX_WIDTH, (VIEWBOX_HEIGHT * Math.max(width, 1)) / Math.max(height, 1));
  const adaptiveViewBoxX = (VIEWBOX_WIDTH - adaptiveViewBoxWidth) / 2;
  const adaptiveViewBox = `${adaptiveViewBoxX.toFixed(1)} 0 ${adaptiveViewBoxWidth.toFixed(1)} ${VIEWBOX_HEIGHT}`;

  useEffect(() => {
    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 8800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 8800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        })
      ])
    );
    const breatheAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false
        })
      ])
    );
    driftAnimation.start();
    breatheAnimation.start();
    return () => {
      driftAnimation.stop();
      breatheAnimation.stop();
    };
  }, [breathe, drift]);

  const atlasTranslateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-18, 20] });
  const atlasTranslateY = drift.interpolate({ inputRange: [0, 1], outputRange: [5, -22] });
  const routeTranslateX = drift.interpolate({ inputRange: [0, 1], outputRange: [18, -16] });
  const routeTranslateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-8, 16] });
  const accentOpacity = breathe.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.72, 1, 0.72] });
  const floatY = breathe.interpolate({ inputRange: [0, 1], outputRange: [10, -24] });

  return (
    <View style={styles.root}>
      <Svg width="100%" height="100%" viewBox={adaptiveViewBox} preserveAspectRatio="xMidYMid meet" style={styles.layer}>
        <Defs>
          <LinearGradient id="backdropWash" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor="#FFF8FB" stopOpacity="0.94" />
            <Stop offset="0.52" stopColor={theme.colors.appBackground} stopOpacity="0.62" />
            <Stop offset="1" stopColor="#F6FAFF" stopOpacity="0.88" />
          </LinearGradient>
        </Defs>
        <Rect x={adaptiveViewBoxX} y="0" width={adaptiveViewBoxWidth} height={VIEWBOX_HEIGHT} fill="url(#backdropWash)" />
        {atlasLines.map((line) => (
          <Path key={line.d} d={line.d} stroke={line.color} strokeWidth={line.width} opacity={line.opacity} fill="none" />
        ))}
      </Svg>

      <Animated.View style={[styles.layer, { transform: [{ translateX: atlasTranslateX }, { translateY: atlasTranslateY }] }]}>
        <Svg width="100%" height="100%" viewBox={adaptiveViewBox} preserveAspectRatio="xMidYMid meet">
          {contourLines.map((line) => (
            <Path key={line.d} d={line.d} stroke={line.color} strokeWidth={line.width} opacity={line.opacity} fill="none" />
          ))}
          <GlobeMark />
          <Path d="M-22 248 C42 214 86 266 137 236 S225 211 286 244 S371 252 424 213" stroke={theme.colors.lineStrong} strokeWidth={1.2} strokeDasharray="4 10" opacity={0.34} fill="none" />
          <Path d="M-18 626 C43 600 84 654 140 623 S226 599 289 633 S362 656 420 615" stroke={theme.colors.lineStrong} strokeWidth={1.1} strokeDasharray="3 10" opacity={0.28} fill="none" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.layer, { opacity: accentOpacity, transform: [{ translateX: routeTranslateX }, { translateY: routeTranslateY }] }]}>
        <Svg width="100%" height="100%" viewBox={adaptiveViewBox} preserveAspectRatio="xMidYMid meet">
          <Path d="M42 382 C97 318 152 407 210 345 S316 310 363 366" stroke={theme.colors.camillyStrong} strokeWidth={1.35} strokeDasharray="5 11" opacity={0.23} fill="none" />
          <Path d="M52 786 C105 731 174 802 230 739 S327 711 389 760" stroke={theme.colors.coupleStrong} strokeWidth={1.25} strokeDasharray="5 10" opacity={0.2} fill="none" />
          <Circle cx={42} cy={382} r={4} fill={theme.colors.surface} stroke={theme.colors.camillyStrong} strokeWidth={1.4} opacity={0.55} />
          <Circle cx={210} cy={345} r={3.6} fill={theme.colors.surface} stroke={theme.colors.pedroStrong} strokeWidth={1.3} opacity={0.5} />
          <Circle cx={363} cy={366} r={4} fill={theme.colors.surface} stroke={theme.colors.coupleStrong} strokeWidth={1.4} opacity={0.5} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.layer, { transform: [{ translateY: floatY }] }]}>
        <Svg width="100%" height="100%" viewBox={adaptiveViewBox} preserveAspectRatio="xMidYMid meet">
          <BoatMark />
          <Path d="M318 144 c-8 -14 -31 -8 -31 10 0 16 31 34 31 34s31 -18 31 -34c0 -18 -23 -24 -31 -10z" fill={theme.colors.camillyStrong} opacity={0.065} />
          <Path d="M74 536 c-7 -12 -27 -7 -27 9 0 14 27 30 27 30s27 -16 27 -30c0 -16 -20 -21 -27 -9z" fill={theme.colors.coupleStrong} opacity={0.055} />
          <Path d="M330 650 C342 618 361 596 385 586" stroke={theme.colors.warningStrong} strokeWidth={4} strokeLinecap="round" opacity={0.08} fill="none" />
          <Path d="M345 690 C354 650 374 624 402 609" stroke={theme.colors.warningStrong} strokeWidth={4} strokeLinecap="round" opacity={0.075} fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

function GlobeMark() {
  return (
    <G opacity={0.22}>
      <Path d={ellipsePath(324, 96, 38, 38)} stroke={theme.colors.coupleStrong} strokeWidth={1.2} fill="none" />
      <Path d={ellipsePath(324, 96, 15, 38)} stroke={theme.colors.coupleStrong} strokeWidth={1.05} fill="none" />
      <Path d={ellipsePath(324, 96, 38, 13)} stroke={theme.colors.coupleStrong} strokeWidth={1.05} fill="none" />
      <Path d="M286 96 H362" stroke={theme.colors.coupleStrong} strokeWidth={1.05} />
      <Path d="M324 58 V134" stroke={theme.colors.coupleStrong} strokeWidth={1.05} />
    </G>
  );
}

function BoatMark() {
  return (
    <G opacity={0.24}>
      <Path d="M18 648 C54 663 94 663 132 648 C126 671 110 684 78 684 H51 C34 684 23 670 18 648 Z" fill={theme.colors.pedroStrong} />
      <Path d="M74 574 L74 644 H30 C38 615 52 593 74 574 Z" fill={theme.colors.coupleStrong} />
      <Path d="M82 580 L82 644 H128 C118 613 103 593 82 580 Z" fill={theme.colors.camillyStrong} />
      <Path d="M26 698 C56 686 88 711 121 697 S181 689 212 702" stroke={theme.colors.lineStrong} strokeWidth={1.7} strokeLinecap="round" fill="none" />
    </G>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none"
  },
  layer: {
    ...StyleSheet.absoluteFillObject
  }
});

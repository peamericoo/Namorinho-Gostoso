import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { theme } from "../../constants/theme";

export function AppBackdrop() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-6, 8] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.layer, { transform: [{ translateX }, { translateY }] }]}>
        <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
          <Path d="M-46 110 C38 68 96 143 176 98 C247 58 294 66 434 14" stroke={theme.colors.pedroStrong} strokeWidth={1.4} opacity={0.12} fill="none" />
          <Path d="M-52 150 C44 105 96 184 184 137 C260 98 323 103 444 50" stroke={theme.colors.camillyStrong} strokeWidth={1.2} opacity={0.13} fill="none" />
          <Path d="M-28 545 C74 493 130 574 218 520 C296 471 345 502 430 438" stroke={theme.colors.coupleStrong} strokeWidth={1.4} opacity={0.12} fill="none" />
          <Path d="M-18 594 C75 545 139 626 226 575 C302 531 348 552 426 494" stroke={theme.colors.successStrong} strokeWidth={1.1} opacity={0.1} fill="none" />
          <Path d="M42 762 C98 703 164 779 226 718 C275 671 323 694 390 642" stroke={theme.colors.warningStrong} strokeWidth={1.1} opacity={0.1} fill="none" />

          <Path d="M318 143 c-8 -14 -31 -8 -31 10 0 16 31 34 31 34s31 -18 31 -34c0 -18 -23 -24 -31 -10z" fill={theme.colors.camillyStrong} opacity={0.08} />
          <Path d="M68 334 c-7 -12 -27 -7 -27 9 0 14 27 30 27 30s27 -16 27 -30c0 -16 -20 -21 -27 -9z" fill={theme.colors.coupleStrong} opacity={0.075} />
          <Path d="M300 670 c-7 -12 -27 -7 -27 9 0 14 27 30 27 30s27 -16 27 -30c0 -16 -20 -21 -27 -9z" fill={theme.colors.pedroStrong} opacity={0.07} />

          <Path d="M50 228 C94 205 117 239 154 215 S226 194 267 221" stroke={theme.colors.lineStrong} strokeWidth={1.5} strokeDasharray="4 9" opacity={0.45} fill="none" />
          <Path d="M116 431 C157 403 190 450 230 420 S300 399 338 438" stroke={theme.colors.lineStrong} strokeWidth={1.5} strokeDasharray="4 9" opacity={0.38} fill="none" />

          <Circle cx={50} cy={228} r={4} fill={theme.colors.surface} stroke={theme.colors.pedroStrong} strokeWidth={1.4} opacity={0.55} />
          <Circle cx={267} cy={221} r={4} fill={theme.colors.surface} stroke={theme.colors.camillyStrong} strokeWidth={1.4} opacity={0.55} />
          <Circle cx={116} cy={431} r={4} fill={theme.colors.surface} stroke={theme.colors.coupleStrong} strokeWidth={1.4} opacity={0.5} />
          <Circle cx={338} cy={438} r={4} fill={theme.colors.surface} stroke={theme.colors.successStrong} strokeWidth={1.4} opacity={0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject
  }
});

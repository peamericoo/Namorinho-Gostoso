import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";

export function Skeleton({ height = 90 }: { height?: number }) {
  return <View style={[styles.skeleton, { height }]} />;
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line
  }
});

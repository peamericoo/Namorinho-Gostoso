import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

type Option<T extends string> = {
  label: string;
  value: T;
  badge?: string;
};

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroller}>
      <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.container}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
            >
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {option.label}
              </Text>
              {option.badge ? <Text style={[styles.badge, active && styles.badgeActive]}>{option.badge}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 1
  },
  container: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  item: {
    minHeight: 38,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.xs
  },
  itemActive: {
    backgroundColor: theme.colors.couple
  },
  itemPressed: {
    opacity: 0.75
  },
  label: {
    color: theme.colors.muted,
    fontWeight: "900",
    fontSize: theme.typography.small
  },
  labelActive: {
    color: theme.colors.coupleStrong
  },
  badge: {
    minWidth: 20,
    textAlign: "center",
    overflow: "hidden",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: theme.colors.text,
    backgroundColor: theme.colors.input,
    fontSize: 11,
    fontWeight: "900"
  },
  badgeActive: {
    color: theme.colors.coupleStrong,
    backgroundColor: theme.colors.surface
  }
});

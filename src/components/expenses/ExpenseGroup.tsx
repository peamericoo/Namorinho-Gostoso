import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";

export function ExpenseGroup({
  label,
  subtitle,
  total,
  count,
  color,
  children
}: {
  label: string;
  subtitle?: string;
  total: number;
  count: number;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
          <View style={styles.copy}>
            <Text style={styles.title}>{label}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <View style={styles.amountWrap}>
          <Text style={styles.amount}>{money(total)}</Text>
          <Text style={styles.count}>{count} gasto(s)</Text>
        </View>
      </View>
      <View style={styles.items}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: theme.spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: theme.radius.pill
  },
  copy: {
    flex: 1
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h2
  },
  subtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    marginTop: 2
  },
  amountWrap: {
    alignItems: "flex-end"
  },
  amount: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  count: {
    color: theme.colors.muted,
    fontWeight: "800",
    fontSize: theme.typography.small
  },
  items: {
    gap: theme.spacing.md
  }
});

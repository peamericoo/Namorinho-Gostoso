import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export function DashboardSection({
  title,
  subtitle,
  right,
  children
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  copy: {
    flex: 1
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: theme.typography.h1,
    lineHeight: 30
  },
  subtitle: {
    color: theme.colors.muted,
    fontWeight: "700",
    marginTop: 3,
    lineHeight: 20
  },
  right: {
    alignItems: "flex-end"
  }
});

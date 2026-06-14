import { AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function SmartAlertCard({
  message,
  tone,
  actionLabel,
  onAction
}: {
  message: string;
  tone: "warning" | "danger" | "success";
  actionLabel?: string;
  onAction?: () => void;
}) {
  const iconColor = tone === "danger" ? theme.colors.dangerStrong : tone === "warning" ? theme.colors.warningStrong : theme.colors.successStrong;
  return (
    <Card style={[styles.card, tone === "danger" && styles.danger, tone === "warning" && styles.warning, tone === "success" && styles.success]}>
      <View style={styles.row}>
        <View style={styles.icon}>{tone === "success" ? <CheckCircle2 color={iconColor} size={22} /> : <AlertTriangle color={iconColor} size={22} />}</View>
        <View style={styles.copy}>
          <Text style={styles.title}>{tone === "danger" ? "Atenção ao orçamento" : tone === "warning" ? "Ponto de atenção" : "Tudo certo"}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      {actionLabel && onAction ? <Button title={actionLabel} variant={tone === "danger" ? "danger" : "secondary"} size="sm" onPress={onAction} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowOpacity: 0.06
  },
  warning: {
    backgroundColor: theme.colors.warning,
    borderColor: "#FBD38D"
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: "#FCA5A5"
  },
  success: {
    backgroundColor: theme.colors.success,
    borderColor: "#BBF7D0"
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface
  },
  copy: {
    flex: 1,
    gap: 2
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  message: {
    color: theme.colors.text,
    fontWeight: "700",
    lineHeight: 20
  }
});

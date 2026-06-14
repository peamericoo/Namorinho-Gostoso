import { AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Button } from "../ui/Button";
import { AppModal } from "../ui/Modal";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  tone: "warning" | "danger" | "success";
  actionLabel?: string;
  route?: string;
};

export function NotificationsSheet({
  visible,
  notifications,
  onClose
}: {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
}) {
  return (
    <AppModal visible={visible} title="Notificações" onClose={onClose}>
      <View style={styles.list}>
        {notifications.map((notification) => (
          <View key={notification.id} style={[styles.item, styles[notification.tone]]}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                {notification.tone === "success" ? (
                  <CheckCircle2 color={theme.colors.successStrong} size={20} />
                ) : (
                  <AlertTriangle color={notification.tone === "danger" ? theme.colors.dangerStrong : theme.colors.warningStrong} size={20} />
                )}
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
              </View>
            </View>
            {notification.actionLabel && notification.route ? (
              <Button
                title={notification.actionLabel}
                variant={notification.tone === "danger" ? "danger" : "secondary"}
                size="sm"
                onPress={() => {
                  onClose();
                  router.push(notification.route as never);
                }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md
  },
  item: {
    minHeight: 118,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    justifyContent: "space-between"
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
  iconWrap: {
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
    fontWeight: "900",
    fontSize: theme.typography.body
  },
  message: {
    color: theme.colors.text,
    fontWeight: "700",
    lineHeight: 20
  }
});

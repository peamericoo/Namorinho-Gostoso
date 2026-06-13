import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, X } from "lucide-react-native";
import { theme } from "../../constants/theme";
import { submitErrorMessage } from "../../lib/formFeedback";
import { AlertBanner } from "./AlertBanner";
import { Button } from "./Button";

export function DeleteButton({
  title = "Excluir",
  confirmTitle,
  message,
  confirmLabel = "Excluir definitivamente",
  loading,
  onConfirm
}: {
  title?: string;
  confirmTitle: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setError("");
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(submitErrorMessage(err, "Não foi possível excluir este registro."));
    }
  }

  function close() {
    setOpen(false);
    setError("");
  }

  return (
    <>
      <Button title={title} variant="danger" loading={loading} onPress={() => setOpen(true)} />
      <Modal transparent animationType="fade" visible={open} onRequestClose={close} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <AlertTriangle color={theme.colors.dangerStrong} size={22} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar confirmação" hitSlop={10} onPress={close} style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}>
                <X color={theme.colors.muted} size={18} />
              </Pressable>
            </View>

            <View style={styles.copy}>
              <Text style={styles.eyebrow}>Ação permanente</Text>
              <Text style={styles.title}>{confirmTitle}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {error ? <AlertBanner tone="danger" message={error} /> : null}

            <View style={styles.actions}>
              <Button title="Cancelar" variant="secondary" onPress={close} style={styles.actionButton} />
              <Button title={confirmLabel} variant="danger" loading={loading} onPress={() => void confirm()} style={styles.actionButton} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FED7AA",
    shadowColor: "#7C2D12",
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA"
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  closePressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }]
  },
  copy: {
    gap: theme.spacing.sm
  },
  eyebrow: {
    color: theme.colors.dangerStrong,
    fontSize: theme.typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  message: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.body,
    lineHeight: 22
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm
  },
  actionButton: {
    minWidth: 150
  }
});

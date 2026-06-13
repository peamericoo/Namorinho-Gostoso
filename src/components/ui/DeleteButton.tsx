import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { submitErrorMessage } from "../../lib/formFeedback";
import { AlertBanner } from "./AlertBanner";
import { Button } from "./Button";
import { AppModal } from "./Modal";

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
      <AppModal visible={open} title={confirmTitle} onClose={close}>
        <Text style={styles.message}>{message}</Text>
        {error ? <AlertBanner tone="danger" message={error} /> : null}
        <View style={styles.actions}>
          <Button title="Cancelar" variant="secondary" onPress={close} />
          <Button title={confirmLabel} variant="danger" loading={loading} onPress={() => void confirm()} />
        </View>
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 21
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  }
});

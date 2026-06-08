import { Modal as RNModal, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { theme } from "../../constants/theme";
import { Button } from "./Button";

export function AppModal({ visible, title, children, onClose }: { visible: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <RNModal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.body}>
            {children}
          </ScrollView>
          <Button title="Fechar" variant="secondary" onPress={onClose} />
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxHeight: "88%"
  },
  body: {
    maxHeight: "80%"
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "900"
  }
});

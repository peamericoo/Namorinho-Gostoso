import { X } from "lucide-react-native";
import { Modal as RNModal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { Button } from "./Button";

export function AppModal({ visible, title, children, onClose }: { visible: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <RNModal transparent animationType="fade" visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={10}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <X color={theme.colors.text} size={20} />
            </Pressable>
          </View>
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
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxHeight: "88%",
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: theme.colors.line,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6
  },
  body: {
    maxHeight: "80%"
  },
  header: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "900"
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  closeButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }]
  }
});

import { ArrowLeft, CalendarHeart, Clock3, HeartHandshake, MapPinned, ShieldCheck } from "lucide-react-native";
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { theme } from "../../constants/theme";
import { AppBackdrop } from "../ui/AppBackdrop";

type AuthLayoutProps = {
  title: string;
  eyebrow: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backLabel?: string;
  onBack?: () => void;
  variant?: "signin" | "signup" | "recovery" | "setup";
};

const storyByVariant = {
  signin: {
    line: "Um lugar calmo para transformar visitas, gastos e planos em combinados claros.",
    focus: "Continue a história de vocês com leveza.",
    icon: HeartHandshake
  },
  signup: {
    line: "Comece organizando o que aproxima: tempo, presença e escolhas financeiras mais tranquilas.",
    focus: "Crie o espaço compartilhado em poucos passos.",
    icon: CalendarHeart
  },
  recovery: {
    line: "Recupere o acesso sem ruído e volte para o plano de vocês.",
    focus: "Segurança simples, sem perder o ritmo.",
    icon: ShieldCheck
  },
  setup: {
    line: "Defina quem é você no casal e abra um espaço financeiro feito para colaboração.",
    focus: "O primeiro combinado cria a base.",
    icon: MapPinned
  }
} as const;

export function AuthLayout({ title, eyebrow, subtitle, children, footer, backLabel, onBack, variant = "signin" }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const story = storyByVariant[variant];
  const StoryIcon = story.icon;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      translateY.setValue(14);
      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: theme.transition.base + 60,
          useNativeDriver: true
        }),
        Animated.spring(translateY, {
          toValue: 0,
          speed: 16,
          bounciness: 4,
          useNativeDriver: true
        })
      ]);
      animation.start();
      return () => animation.stop();
    }, [opacity, translateY])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackdrop />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, compact && styles.scrollCompact]}>
          <Animated.View style={[styles.shell, compact && styles.shellCompact, { opacity, transform: [{ translateY }] }]}>
            <View style={[styles.storyPanel, compact && styles.storyPanelCompact]}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <StoryIcon color={theme.colors.surface} size={22} />
                </View>
                <View>
                  <Text style={styles.brandName}>Plano a Dois</Text>
                  <Text style={styles.brandSub}>tempo, presença e cuidado</Text>
                </View>
              </View>

              <View style={styles.storyContent}>
                <Text style={styles.storyEyebrow}>feito para relações reais</Text>
                <Text style={styles.storyTitle}>{story.focus}</Text>
                <Text style={styles.storyText}>{story.line}</Text>
              </View>

              <View style={styles.memoryRail} accessibilityLabel="Pilares do produto">
                <View style={styles.memoryItem}>
                  <Clock3 color={theme.colors.pedroStrong} size={18} />
                  <View>
                    <Text style={styles.memoryTitle}>Tempo investido</Text>
                    <Text style={styles.memoryText}>planos visíveis antes da correria</Text>
                  </View>
                </View>
                <View style={styles.memoryItem}>
                  <MapPinned color={theme.colors.camillyStrong} size={18} />
                  <View>
                    <Text style={styles.memoryTitle}>Caminhos compartilhados</Text>
                    <Text style={styles.memoryText}>viagens, visitas e escolhas no mesmo lugar</Text>
                  </View>
                </View>
                <View style={styles.memoryItem}>
                  <ShieldCheck color={theme.colors.successStrong} size={18} />
                  <View>
                    <Text style={styles.memoryTitle}>Combinados em paz</Text>
                    <Text style={styles.memoryText}>clareza sem clima de planilha fria</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.formPanel, compact && styles.formPanelCompact]}>
              {onBack ? (
                <Pressable accessibilityRole="button" accessibilityLabel={backLabel ?? "Voltar"} onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
                  <ArrowLeft color={theme.colors.text} size={18} />
                  <Text style={styles.backText}>{backLabel ?? "Voltar"}</Text>
                </Pressable>
              ) : null}
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              <View style={styles.form}>{children}</View>
              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthMessage({ tone = "danger", children }: { tone?: "danger" | "success"; children: React.ReactNode }) {
  return (
    <View style={[styles.message, tone === "success" ? styles.messageSuccess : styles.messageDanger]}>
      <Text style={[styles.messageText, tone === "success" ? styles.messageTextSuccess : styles.messageTextDanger]}>{children}</Text>
    </View>
  );
}

export function AuthTextLink({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.textLinkButton, pressed && styles.textLinkPressed]}>
      <Text style={styles.textLink}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.appBackground
  },
  keyboard: {
    flex: 1,
    zIndex: 1
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl
  },
  scrollCompact: {
    justifyContent: "flex-start",
    paddingHorizontal: theme.spacing.lg
  },
  shell: {
    width: "100%",
    maxWidth: 1080,
    minHeight: 650,
    flexDirection: "row",
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.28)",
    backgroundColor: "rgba(255,255,255,0.74)",
    ...theme.shadow
  },
  shellCompact: {
    minHeight: 0,
    flexDirection: "column"
  },
  storyPanel: {
    flex: 1,
    minWidth: 410,
    padding: theme.spacing.xxl,
    justifyContent: "space-between",
    backgroundColor: "#F7FBFF",
    borderRightWidth: 1,
    borderRightColor: "rgba(148, 163, 184, 0.24)"
  },
  storyPanelCompact: {
    minWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.24)",
    gap: theme.spacing.xl
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.coupleStrong
  },
  brandName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  brandSub: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  storyContent: {
    gap: theme.spacing.md,
    maxWidth: 440
  },
  storyEyebrow: {
    color: theme.colors.camillyStrong,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  storyTitle: {
    color: theme.colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900"
  },
  storyText: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "700"
  },
  memoryRail: {
    gap: theme.spacing.md
  },
  memoryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)"
  },
  memoryTitle: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  memoryText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  formPanel: {
    flex: 1,
    minWidth: 390,
    padding: theme.spacing.xxl,
    justifyContent: "center",
    backgroundColor: theme.colors.surface
  },
  formPanelCompact: {
    minWidth: 0,
    padding: theme.spacing.xl
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  backButtonPressed: {
    opacity: 0.72
  },
  backText: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  heading: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl
  },
  eyebrow: {
    color: theme.colors.pedroStrong,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900"
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700"
  },
  form: {
    gap: theme.spacing.md
  },
  footer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md
  },
  message: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md
  },
  messageDanger: {
    backgroundColor: theme.colors.danger,
    borderColor: "#FDBA74"
  },
  messageSuccess: {
    backgroundColor: theme.colors.success,
    borderColor: "#86EFAC"
  },
  messageText: {
    fontWeight: "800",
    lineHeight: 20
  },
  messageTextDanger: {
    color: theme.colors.dangerStrong
  },
  messageTextSuccess: {
    color: theme.colors.successStrong
  },
  textLinkButton: {
    alignSelf: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md
  },
  textLinkPressed: {
    opacity: 0.72
  },
  textLink: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    textAlign: "center"
  }
});

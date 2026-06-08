import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, usePathname } from "expo-router";
import { ArrowRight, CheckCircle2, Heart, Sparkles, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { useWorkspace } from "../../hooks/useWorkspace";
import { getAppSetting, upsertAppSetting } from "../../services/finance.service";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

const steps = [
  {
    route: "/",
    eyebrow: "Boas-vindas",
    title: "Oi, Camilly. Esse é o cantinho de vocês 💜",
    body:
      "Aqui você enxerga o resumo do relacionamento financeiro: viagens planejadas, gastos reais, alertas e quem precisa acertar com quem. Comece olhando os cards do Painel: eles respondem 'quanto planejamos?', 'quanto gastamos?' e 'está tudo equilibrado?'.",
    task: "Leia o Painel de cima para baixo e repare no card 'Divisão e acertos'. Ele é o coração da organização.",
    actionLabel: "Ver Painel",
    icon: Heart
  },
  {
    route: "/trips/new",
    eyebrow: "Primeira simulação",
    title: "Crie uma viagem de teste, sem medo",
    body:
      "Agora é hora de praticar. Cadastre uma viagem simples: escolha quem viaja, quem recebe, cidade de origem, destino, datas no calendário bonito e um orçamento estimado. Pode ser algo como 'Camilly em Cuiabá'.",
    task: "Preencha os campos principais e salve. Se ainda não souber algum link, deixe em branco; o app vai lembrar vocês depois.",
    actionLabel: "Criar viagem",
    icon: Sparkles
  },
  {
    route: "/planned-expenses",
    eyebrow: "Planejamento",
    title: "Antes de gastar, combine o previsto",
    body:
      "Em Custos planejados vocês colocam passagens, hospedagem, comida, presentes ou qualquer estimativa. Isso ajuda a comparar o sonho com o valor real depois.",
    task: "Toque em Adicionar e crie um custo planejado com valor aproximado. Use Pedro, Camilly ou ambos conforme quem vai pagar.",
    actionLabel: "Planejar custo",
    icon: ArrowRight
  },
  {
    route: "/expenses/new",
    eyebrow: "Gasto real",
    title: "Registre o que aconteceu de verdade",
    body:
      "Quando alguém pagar algo, registre aqui: data, viagem, pessoa que pagou, categoria, valor e se deve dividir. É isso que alimenta o histórico e calcula o acerto final.",
    task: "Crie um gasto de exemplo. Marque 'Deve dividir?' quando o gasto for do casal, e ajuste os percentuais se não for 50/50.",
    actionLabel: "Registrar gasto",
    icon: ArrowRight
  },
  {
    route: "/settlements",
    eyebrow: "Acertos",
    title: "Veja quem deve pagar para quem",
    body:
      "A tela de Divisão e acertos junta tudo: quem pagou, quanto cada um deveria pagar e qual Pix resolve a diferença. Não precisa fazer conta na mão.",
    task: "Depois de registrar gastos, volte aqui e confira a frase principal. Se estiver tudo certo, marque como acertado.",
    actionLabel: "Ver acertos",
    icon: CheckCircle2
  },
  {
    route: "/checklist",
    eyebrow: "Checklist",
    title: "Transforme ansiedade em listinha tranquila",
    body:
      "Checklist é para documentos, mala, passagem, reserva, presentes e tudo que não pode ficar só na cabeça. Cada item tem responsável, prazo e status.",
    task: "Adicione um item, marque como concluído e veja o progresso mudar. É simples e dá uma paz enorme.",
    actionLabel: "Abrir checklist",
    icon: CheckCircle2
  },
  {
    route: "/savings",
    eyebrow: "Metas",
    title: "Guardem dinheiro com carinho e clareza",
    body:
      "Em Economia e metas vocês acompanham quanto falta juntar para uma viagem ou objetivo. Isso deixa o plano visível e menos pesado.",
    task: "Crie uma meta pequena para o mês e associe a uma viagem se fizer sentido.",
    actionLabel: "Criar meta",
    icon: Heart
  },
  {
    route: "/simulator",
    eyebrow: "Simulador",
    title: "Antes de decidir, simule o cenário",
    body:
      "O simulador serve para brincar com valores antes de criar uma viagem oficial. Mude passagem, diária, alimentação e meses até a viagem para ver o impacto.",
    task: "Faça uma simulação e, quando gostar do plano, salve como viagem.",
    actionLabel: "Simular",
    icon: Sparkles
  },
  {
    route: "/settings",
    eyebrow: "Pronto",
    title: "Você já sabe o essencial ✨",
    body:
      "Se quiser ver este guia outra vez, vá em Configurações e toque em 'Reabrir tutorial'. O app foi feito para vocês cuidarem das visitas com leveza, combinados claros e menos preocupação.",
    task: "Finalize o tutorial e comece usando no ritmo de vocês.",
    actionLabel: "Finalizar",
    icon: CheckCircle2
  }
] as const;

type TutorialMode = "auto" | "manual";
const tutorialListeners = new Set<() => void>();
const tutorialSettingKey = "tutorial:first-access";

export function FirstAccessTutorial() {
  const auth = useAuth();
  const workspace = useWorkspace();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<TutorialMode>("auto");
  const [open, setOpen] = useState(false);

  const profile = workspace.data?.profile;
  const coupleId = workspace.data?.couple?.id ?? null;
  const tutorialSetting = useQuery({
    queryKey: ["app-setting", tutorialSettingKey, coupleId],
    queryFn: () => getAppSetting(coupleId!, tutorialSettingKey),
    enabled: Boolean(coupleId)
  });
  const tutorialCompletedAt = typeof tutorialSetting.data?.completed_at === "string" ? tutorialSetting.data.completed_at : null;
  const shouldAutoOpen = Boolean(auth.user && profile && coupleId && !tutorialSetting.isLoading && !tutorialCompletedAt && !pathname.startsWith("/auth"));

  useEffect(() => {
    if (shouldAutoOpen) {
      setMode("auto");
      setOpen(true);
    }
  }, [shouldAutoOpen]);

  useEffect(() => {
    const listener = () => {
      setStepIndex(0);
      setMode("manual");
      setOpen(true);
    };
    tutorialListeners.add(listener);
    return () => {
      tutorialListeners.delete(listener);
    };
  }, []);

  const finishMutation = useMutation({
    mutationFn: () => upsertAppSetting(coupleId!, tutorialSettingKey, { completed_at: new Date().toISOString() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      await queryClient.invalidateQueries({ queryKey: ["app-setting", tutorialSettingKey] });
      setOpen(false);
      router.replace("/");
    }
  });

  const step = steps[stepIndex];
  const progress = useMemo(() => (stepIndex + 1) / steps.length, [stepIndex]);
  const Icon = step.icon;

  if (!auth.user || !profile || !workspace.data?.couple) return null;

  async function finish() {
    await finishMutation.mutateAsync();
  }

  async function skip() {
    await finish();
  }

  function goToStep(index: number) {
    const nextStep = steps[index];
    setStepIndex(index);
    router.push(nextStep.route);
  }

  async function primaryAction() {
    if (stepIndex === steps.length - 1) {
      await finish();
      return;
    }
    router.push(step.route);
  }

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBubble}>
              <Icon color={theme.colors.coupleStrong} size={22} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Pular tutorial" onPress={skip} style={styles.close}>
              <X color={theme.colors.muted} size={20} />
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>{step.eyebrow}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          <View style={styles.taskBox}>
            <Text style={styles.taskLabel}>Faça agora</Text>
            <Text style={styles.task}>{step.task}</Text>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Passo {stepIndex + 1} de {steps.length}</Text>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar value={progress} tone="couple" />

          <View style={styles.dots}>
            {steps.map((item, index) => (
              <Pressable
                key={item.eyebrow}
                accessibilityRole="button"
                accessibilityLabel={`Ir para ${item.eyebrow}`}
                onPress={() => goToStep(index)}
                style={[styles.dot, index === stepIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button title="Pular" variant="ghost" onPress={skip} />
            {stepIndex > 0 ? <Button title="Voltar" variant="secondary" onPress={() => goToStep(stepIndex - 1)} /> : null}
            <Button title={step.actionLabel} onPress={primaryAction} loading={finishMutation.isPending} />
            {stepIndex < steps.length - 1 ? <Button title="Próximo" variant="secondary" onPress={() => goToStep(stepIndex + 1)} /> : null}
          </View>

          {mode === "manual" ? <Text style={styles.note}>Você reabriu esse guia pelas Configurações. Pode fechar quando quiser.</Text> : null}
        </Card>
      </View>
    </Modal>
  );
}

export function openFirstAccessTutorial() {
  tutorialListeners.forEach((listener) => listener());
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.34)",
    justifyContent: "flex-end",
    padding: theme.spacing.lg
  },
  card: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: theme.spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.couple,
    borderWidth: 1,
    borderColor: theme.colors.focusRing
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input,
    borderWidth: 1,
    borderColor: theme.colors.line
  },
  eyebrow: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: theme.typography.small
  },
  title: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 30
  },
  body: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 23
  },
  taskBox: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.focusRing,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs
  },
  taskLabel: {
    color: theme.colors.coupleStrong,
    fontWeight: "900",
    fontSize: theme.typography.small,
    textTransform: "uppercase"
  },
  task: {
    color: theme.colors.text,
    fontWeight: "800",
    lineHeight: 21
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  progressText: {
    color: theme.colors.muted,
    fontWeight: "800",
    fontSize: theme.typography.small
  },
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  dot: {
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.lineStrong
  },
  dotActive: {
    width: 32,
    backgroundColor: theme.colors.coupleStrong
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  note: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: theme.typography.small
  }
});

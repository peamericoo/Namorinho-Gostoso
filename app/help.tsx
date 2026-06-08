import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";

const sections = [
  ["Como começar", "Entre com o usuário demo ou crie sua conta, depois revise Configurações e veja os dados de exemplo."],
  ["Criar viagem", "Use Viagens > Adicionar. Datas, cidades, orçamento e links alimentam o Painel."],
  ["Registrar gasto", "Use Gastos > Adicionar. Informe quem pagou, valor, categoria e percentuais de divisão."],
  ["Dividir custos", "Quando Deve dividir está ativo, Pedro e Camilly dividem pelo percentual informado."],
  ["Ver acertos", "Abra Divisão e acertos para ver quem deve pagar para quem e registrar o Pix."],
  ["Usar simulador", "Preencha valores estimados e salve a simulação como viagem quando fizer sentido."],
  ["Metas e parcelas", "Use Economia e metas e Parcelamentos para controlar impacto mensal e vencimentos."]
];

export default function HelpScreen() {
  return (
    <Screen>
      <Header title="Ajuda rápida" subtitle="O essencial para manter os dados organizados." back onBack={() => router.replace("/(tabs)/more")} />
      {sections.map(([title, body]) => (
        <Card key={title}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  body: { color: theme.colors.muted, fontWeight: "700", lineHeight: 22 }
});

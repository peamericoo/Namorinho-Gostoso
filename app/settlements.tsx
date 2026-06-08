import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { Header } from "../src/components/ui/Header";
import { Screen } from "../src/components/ui/Screen";
import { PersonBalanceCard } from "../src/components/finance/PersonBalanceCard";
import { theme } from "../src/constants/theme";
import { useExpenses, useSettlementMutations, useSettlements } from "../src/hooks/useFinanceData";
import { calculateSettlement } from "../src/lib/calculations";
import { dateBR, money, personName } from "../src/lib/formatters";

export default function SettlementsScreen() {
  const expenses = useExpenses();
  const settlements = useSettlements();
  const mutations = useSettlementMutations();
  const result = useMemo(() => calculateSettlement(expenses.data ?? []), [expenses.data]);
  async function settle() {
    if (!result.payer || !result.receiver || result.amount <= 0) return;
    await mutations.create.mutateAsync({
      payer_person: result.payer,
      receiver_person: result.receiver,
      amount: result.amount,
      status: "concluido",
      settled_at: new Date().toISOString().slice(0, 10),
      payment_method: "Pix",
      notes: result.message
    });
  }
  return (
    <Screen>
      <Header title="Divisão e acertos" subtitle="Veja quem pagou, quem deveria pagar e o acerto sugerido." back onBack={() => router.replace("/(tabs)/more")} />
      <Card>
        <Text style={styles.result}>{result.message}</Text>
        <Text style={styles.meta}>Valor sugerido: {money(result.amount)}</Text>
        <Button title="Marcar como acertado" disabled={result.amount <= 0} loading={mutations.create.isPending} onPress={settle} />
      </Card>
      <View style={styles.grid}>
        <PersonBalanceCard name="Pedro" paid={result.totalPaidByPedro} responsibility={result.pedroResponsibility} tone="pedro" />
        <PersonBalanceCard name="Camilly" paid={result.totalPaidByCamilly} responsibility={result.camillyResponsibility} tone="camilly" />
      </View>
      <Text style={styles.section}>Histórico de acertos</Text>
      {(settlements.data ?? []).map((item) => (
        <Card key={item.id}>
          <Text style={styles.title}>{personName(item.payer_person)} pagou {money(item.amount)} para {personName(item.receiver_person)}</Text>
          <Text style={styles.meta}>{item.status} · {dateBR(item.settled_at)} · {item.payment_method}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: { color: theme.colors.coupleStrong, fontSize: 22, fontWeight: "900" },
  meta: { color: theme.colors.muted, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.md },
  section: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  title: { color: theme.colors.text, fontWeight: "900" }
});

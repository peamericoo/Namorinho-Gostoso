import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Header } from "../../src/components/ui/Header";
import { Screen } from "../../src/components/ui/Screen";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";

const links = [
  ["Divisão e acertos", "/settlements"],
  ["Custos planejados", "/planned-expenses"],
  ["Checklist", "/checklist"],
  ["Roteiro e agenda", "/itinerary"],
  ["Economia e metas", "/savings"],
  ["Parcelamentos", "/installments"],
  ["Categorias", "/categories"],
  ["Configurações", "/settings"],
  ["Ajuda rápida", "/help"]
] as const;

export default function MoreScreen() {
  const auth = useAuth();
  return (
    <Screen>
      <Header title="Mais" subtitle="Controles financeiros e organização da viagem." />
      <View style={styles.grid}>
        {links.map(([label, href]) => (
          <Card key={href} style={styles.card} onPress={() => router.push(href)} accessibilityLabel={`Abrir ${label}`}>
            <Text style={styles.label}>{label}</Text>
            <ChevronRight color={theme.colors.coupleStrong} size={22} />
          </Card>
        ))}
      </View>
      <Button
        title="Sair"
        variant="danger"
        onPress={() => {
          void auth.signOut().then(() => router.replace("/auth/login"));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: theme.spacing.md },
  card: { gap: theme.spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 }
});

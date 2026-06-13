import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoryForm } from "../src/components/forms/CategoryForm";
import { CategoryIcon } from "../src/components/finance/CategoryIcon";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { DeleteButton } from "../src/components/ui/DeleteButton";
import { Header } from "../src/components/ui/Header";
import { AppModal } from "../src/components/ui/Modal";
import { Screen } from "../src/components/ui/Screen";
import { theme } from "../src/constants/theme";
import { useCategories, useCategoryMutations } from "../src/hooks/useFinanceData";

export default function CategoriesScreen() {
  const [open, setOpen] = useState(false);
  const categories = useCategories();
  const mutations = useCategoryMutations();
  return (
    <Screen>
      <Header title="Categorias" subtitle="Gerencie categorias e subcategorias do casal." back onBack={() => router.replace("/(tabs)/more")} right={<Button title="Adicionar" onPress={() => setOpen(true)} />} />
      {(categories.data ?? []).map((category) => (
        <Card key={category.id}>
          <View style={styles.row}>
            <CategoryIcon icon={category.icon} color={category.color} />
            <View style={styles.copy}>
              <Text style={styles.title}>{category.name}</Text>
              <Text style={styles.meta}>{category.is_default ? "Categoria padrão" : "Categoria personalizada"}</Text>
            </View>
            {!category.is_default ? (
              <DeleteButton
                confirmTitle="Excluir categoria"
                message="Essa ação remove a categoria personalizada. Gastos que já usavam essa categoria ficam sem categoria associada."
                loading={mutations.remove.isPending}
                onConfirm={() => mutations.remove.mutateAsync(category.id)}
              />
            ) : null}
          </View>
        </Card>
      ))}
      <AppModal visible={open} title="Nova categoria" onClose={() => setOpen(false)}>
        <CategoryForm
          loading={mutations.create.isPending}
          onSubmit={async (values) => {
            await mutations.create.mutateAsync(values);
            setOpen(false);
          }}
        />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: theme.spacing.md, alignItems: "center" },
  copy: { flex: 1 },
  title: { color: theme.colors.text, fontWeight: "900", fontSize: theme.typography.h2 },
  meta: { color: theme.colors.muted, fontWeight: "700" }
});

import { Search } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { Input } from "../ui/Input";

export function ExpenseSearch({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Search color={theme.colors.coupleStrong} size={18} />
      </View>
      <Input
        label="Buscar"
        value={value}
        onChangeText={onChangeText}
        placeholder="Descrição, pessoa, viagem, categoria, data, valor..."
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative"
  },
  icon: {
    position: "absolute",
    left: theme.spacing.lg,
    top: 34,
    zIndex: 1
  },
  input: {
    paddingLeft: 44
  }
});

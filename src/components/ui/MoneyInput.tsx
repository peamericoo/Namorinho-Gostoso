import type { TextInputProps } from "react-native";
import { Input } from "./Input";

export function MoneyInput(props: Omit<TextInputProps, "keyboardType"> & { label: string; error?: string; helperText?: string; required?: boolean }) {
  return <Input keyboardType="decimal-pad" placeholder="0,00" {...props} />;
}

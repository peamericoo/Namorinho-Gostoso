import type { TextInputProps } from "react-native";
import { Input } from "./Input";

export function DateInput(props: Omit<TextInputProps, "placeholder"> & { label: string; error?: string }) {
  return <Input placeholder="AAAA-MM-DD" autoCapitalize="none" {...props} />;
}

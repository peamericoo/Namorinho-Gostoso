import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const serverMemory = new Map<string, string>();
const isServerWeb = Platform.OS === "web" && typeof window === "undefined";

export const secureSessionStorage = {
  async getItem(key: string) {
    if (isServerWeb) return serverMemory.get(key) ?? null;
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (isServerWeb) {
      serverMemory.set(key, value);
      return;
    }
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (isServerWeb) {
      serverMemory.delete(key);
      return;
    }
    if (Platform.OS === "web") return AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  }
};

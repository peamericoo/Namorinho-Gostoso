import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AppState = {
  themePreference: "claro" | "escuro";
  onboardingDismissed: boolean;
  setThemePreference: (themePreference: "claro" | "escuro") => Promise<void>;
  dismissOnboarding: () => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  themePreference: "claro",
  onboardingDismissed: false,
  async setThemePreference(themePreference) {
    await AsyncStorage.setItem("themePreference", themePreference);
    set({ themePreference });
  },
  async dismissOnboarding() {
    await AsyncStorage.setItem("onboardingDismissed", "true");
    set({ onboardingDismissed: true });
  }
}));

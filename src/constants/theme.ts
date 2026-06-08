import { Platform } from "react-native";

export const theme = {
  colors: {
    background: "#F8FAFC",
    appBackground: "#F4F1F6",
    surface: "#FFFFFF",
    surfaceAlt: "#F8F3FF",
    text: "#263238",
    muted: "#64748B",
    line: "#E2E8F0",
    pedro: "#DDEBFF",
    pedroStrong: "#4779C4",
    camilly: "#FCE0EC",
    camillyStrong: "#C067A0",
    couple: "#EEE3FF",
    coupleStrong: "#6C63B7",
    success: "#DDF7E9",
    successStrong: "#2F9E65",
    warning: "#FFF3C4",
    warningStrong: "#B7791F",
    danger: "#FEE2E2",
    dangerStrong: "#C2410C",
    input: "#EFF6FF"
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999
  },
  typography: {
    title: 28,
    h1: 24,
    h2: 18,
    body: 15,
    small: 12
  },
  shadow: Platform.select({
    web: {
      boxShadow: "0 10px 30px rgba(71, 85, 105, 0.12)"
    },
    default: {
      shadowColor: "#334155",
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3
    }
  })
};

export const appMaxWidth = 1120;

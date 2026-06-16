import { ArrowRightLeft, ClipboardList, Handshake, Info, ReceiptText, Users, WalletCards, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import { calculateSettlement, tripSummary } from "../../lib/calculations";
import { money } from "../../lib/formatters";
import type { Expense, PlannedExpense, Settlement, Trip } from "../../types/models";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type DashboardFinancialSummaryProps = {
  trip: Trip;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  settlements: Settlement[];
  style?: StyleProp<ViewStyle>;
};

type FinancialTone = "neutral" | "realized" | "danger" | "pedro" | "camilly" | "success";

export function DashboardFinancialSummary({ trip, expenses, plannedExpenses, settlements, style }: DashboardFinancialSummaryProps) {
  const settlement = calculateSettlement(expenses, settlements);
  const summary = tripSummary(trip, expenses, plannedExpenses);
  const overBudget = summary.difference < 0;
  const tiles = [
    { label: "Planejado", value: money(summary.planned), tone: "neutral" as const, Icon: ClipboardList },
    { label: "Realizado", value: money(summary.actual), tone: "realized" as const, Icon: WalletCards },
    { label: "Diferença", value: money(summary.difference), tone: overBudget ? ("danger" as const) : ("success" as const), Icon: ArrowRightLeft },
    { label: "Pedro pagou", value: money(settlement.totalPaidByPedro), tone: "pedro" as const, Icon: Users },
    { label: "Camilly pagou", value: money(settlement.totalPaidByCamilly), tone: "camilly" as const, Icon: ReceiptText },
    { label: "Acerto", value: money(settlement.amount), tone: settlement.amount > 0 ? ("danger" as const) : ("success" as const), Icon: Handshake }
  ];

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo financeiro</Text>
        <Badge label={overBudget ? "Acima do orçamento" : "Dentro do orçamento"} tone={overBudget ? "danger" : "success"} />
      </View>

      <View style={styles.grid}>
        {tiles.map((tile) => (
          <FinancialTile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} Icon={tile.Icon} />
        ))}
      </View>

      <View style={styles.note}>
        <Info color={theme.colors.muted} size={21} strokeWidth={2.3} />
        <Text style={styles.noteText}>{punctuate(settlement.message)}</Text>
      </View>
    </Card>
  );
}

function FinancialTile({ label, value, tone, Icon }: { label: string; value: string; tone: FinancialTone; Icon: LucideIcon }) {
  return (
    <View style={[styles.tile, styles[`${tone}Tile`]]}>
      <View style={[styles.iconShell, styles[`${tone}Icon`]]}>
        <Icon color={toneColor[tone]} size={23} strokeWidth={2.5} />
      </View>
      <View style={styles.tileCopy}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function punctuate(message: string) {
  return /[.!?]$/.test(message) ? message : `${message}.`;
}

const palette = {
  ink: "#111827",
  primary: "#FF3F5F",
  neutral: "#64748B",
  realized: "#7C5CF6",
  pedro: "#3B82F6",
  camilly: "#F97316",
  success: "#25A46A"
};

const toneColor: Record<FinancialTone, string> = {
  neutral: palette.neutral,
  realized: palette.realized,
  danger: palette.primary,
  pedro: palette.pedro,
  camilly: palette.camilly,
  success: palette.success
};

const styles = StyleSheet.create({
  card: {
    minHeight: 286
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    flexWrap: "wrap"
  },
  title: {
    color: palette.ink,
    fontSize: theme.typography.h2,
    lineHeight: 24,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  tile: {
    flex: 1,
    minWidth: 174,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  neutralTile: {
    backgroundColor: "#FFFFFF"
  },
  realizedTile: {
    backgroundColor: "#FEFCFF"
  },
  dangerTile: {
    backgroundColor: "#FFF5F7",
    borderColor: "#FFD4DD"
  },
  pedroTile: {
    backgroundColor: "#F4F9FF",
    borderColor: "#DCEBFF"
  },
  camillyTile: {
    backgroundColor: "#FFF8F1",
    borderColor: "#FFE2C7"
  },
  successTile: {
    backgroundColor: "#F3FFF8",
    borderColor: "#D8F5E4"
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.input
  },
  neutralIcon: {
    backgroundColor: "#F1F5F9"
  },
  realizedIcon: {
    backgroundColor: "#F0EAFF"
  },
  dangerIcon: {
    backgroundColor: "#FFE7EC"
  },
  pedroIcon: {
    backgroundColor: "#E7F1FF"
  },
  camillyIcon: {
    backgroundColor: "#FFEDDD"
  },
  successIcon: {
    backgroundColor: "#DFF8EA"
  },
  tileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  tileLabel: {
    color: theme.colors.muted,
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 16
  },
  tileValue: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 17,
    lineHeight: 22
  },
  note: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  noteText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  }
});

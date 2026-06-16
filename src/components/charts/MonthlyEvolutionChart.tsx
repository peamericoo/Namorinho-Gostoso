import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function MonthlyEvolutionChart({ expenses, plannedTotal = 0, framed = true }: { expenses: Expense[]; plannedTotal?: number; framed?: boolean }) {
  const groups = new Map<string, { label: string; date: number; value: number }>();
  expenses.forEach((expense) => {
    const key = format(parseISO(expense.spent_at), "MMM/yy", { locale: ptBR });
    const current = groups.get(key) ?? { label: key, date: parseISO(expense.spent_at).getTime(), value: 0 };
    current.value += expense.amount;
    groups.set(key, current);
  });
  const rows = Array.from(groups.values()).sort((a, b) => a.date - b.date).slice(-6);
  const plannedRows = rows.map((row, index) => ({ ...row, value: rows.length ? plannedTotal * ((index + 1) / rows.length) : 0 }));
  const max = Math.max(...rows.map((row) => row.value), ...plannedRows.map((row) => row.value), 1);
  const actualPoints = pointsFor(rows, max);
  const plannedPoints = pointsFor(plannedRows, max);

  const content = (
    <>
      <View style={styles.legend}>
        <LegendDot color="#38A8E8" label="Planejado" />
        <LegendDot color="#7C5CF6" label="Realizado" />
      </View>
      <View style={styles.chartBox}>
        {rows.length === 0 ? (
          <Text style={styles.empty}>Sem gastos mensais ainda.</Text>
        ) : (
          <Svg width="100%" height="170" viewBox="0 0 360 170">
            {[0, 1, 2].map((line) => {
              const y = 24 + line * 45;
              return <Line key={line} x1="36" x2="344" y1={y} y2={y} stroke="#EEF2F7" strokeWidth="1.5" />;
            })}
            <SvgText x="2" y="28" fill="#64748B" fontSize="11" fontWeight="700">{money(max)}</SvgText>
            <SvgText x="2" y="73" fill="#64748B" fontSize="11" fontWeight="700">{money(max / 2)}</SvgText>
            <SvgText x="2" y="118" fill="#64748B" fontSize="11" fontWeight="700">R$ 0</SvgText>
            <Path d={pathFor(plannedPoints)} fill="none" stroke="#38A8E8" strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" strokeLinejoin="round" />
            <Path d={pathFor(actualPoints)} fill="none" stroke="#7C5CF6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {actualPoints.map((point) => (
              <Circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#7C5CF6" />
            ))}
            {actualPoints.map((point) => (
              <SvgText key={`${point.label}-label`} x={point.x} y="152" fill="#111827" fontSize="11" fontWeight="900" textAnchor="middle">
                {point.label}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>
    </>
  );

  if (!framed) return <View style={styles.embedded}>{content}</View>;

  return (
    <ChartCard title="Evolução mensal">
      {content}
    </ChartCard>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function pointsFor(rows: { label: string; value: number }[], max: number) {
  const left = 56;
  const width = 286;
  const top = 24;
  const height = 92;
  const divisor = Math.max(rows.length - 1, 1);
  return rows.map((row, index) => ({
    label: row.label,
    x: rows.length === 1 ? left + width / 2 : left + (width * index) / divisor,
    y: top + height - (row.value / max) * height
  }));
}

function pathFor(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

const styles = StyleSheet.create({
  embedded: { gap: theme.spacing.md },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.lg
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  chartBox: {
    minHeight: 170,
    justifyContent: "center"
  },
  empty: { color: theme.colors.muted, fontWeight: "700" }
});

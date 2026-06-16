import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { theme } from "../../constants/theme";
import { money } from "../../lib/formatters";
import type { Expense } from "../../types/models";
import { ChartCard } from "./ChartCard";

export function MonthlyEvolutionChart({ expenses, plannedTotal = 0, framed = true }: { expenses: Expense[]; plannedTotal?: number; framed?: boolean }) {
  const { width } = useWindowDimensions();
  const chart = chartLayoutFor(width);
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
  const actualPoints = pointsFor(rows, max, chart);
  const plannedPoints = pointsFor(plannedRows, max, chart);

  const content = (
    <>
      <View style={styles.legend}>
        <LegendDot color="#38A8E8" label="Planejado" />
        <LegendDot color="#7C5CF6" label="Realizado" />
      </View>
      <View style={[styles.chartBox, { minHeight: chart.height }]}>
        {rows.length === 0 ? (
          <Text style={styles.empty}>Sem gastos mensais ainda.</Text>
        ) : (
          <Svg width="100%" height={chart.height} viewBox={`0 0 ${chart.viewWidth} ${chart.height}`} style={styles.svg}>
            {[0, 1, 2].map((line) => {
              const y = chart.top + line * chart.gridGap;
              return <Line key={line} x1={chart.gridX1} x2={chart.gridX2} y1={y} y2={y} stroke="#EEF2F7" strokeWidth="2" />;
            })}
            <SvgText x="2" y={chart.top + 5} fill="#64748B" fontSize={chart.fontSize} fontWeight="800">{money(max)}</SvgText>
            <SvgText x="2" y={chart.top + chart.gridGap + 5} fill="#64748B" fontSize={chart.fontSize} fontWeight="800">{money(max / 2)}</SvgText>
            <SvgText x="2" y={chart.top + chart.gridGap * 2 + 5} fill="#64748B" fontSize={chart.fontSize} fontWeight="800">R$ 0</SvgText>
            <Path d={pathFor(plannedPoints)} fill="none" stroke="#38A8E8" strokeWidth={chart.plannedStroke} strokeDasharray={chart.dash} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={pathFor(actualPoints)} fill="none" stroke="#7C5CF6" strokeWidth={chart.actualStroke} strokeLinecap="round" strokeLinejoin="round" />
            {actualPoints.map((point) => (
              <Circle key={point.label} cx={point.x} cy={point.y} r={chart.pointRadius} fill="#7C5CF6" />
            ))}
            {actualPoints.map((point) => (
              <SvgText key={`${point.label}-label`} x={point.x} y={chart.labelY} fill="#111827" fontSize={chart.fontSize} fontWeight="900" textAnchor="middle">
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

type ChartLayout = ReturnType<typeof chartLayoutFor>;

function chartLayoutFor(width: number) {
  if (width < 640) {
    return {
      viewWidth: 420,
      height: 220,
      top: 34,
      gridGap: 56,
      gridX1: 72,
      gridX2: 402,
      plotLeft: 86,
      plotWidth: 290,
      plotHeight: 112,
      labelY: 194,
      fontSize: 12,
      plannedStroke: 4,
      actualStroke: 5,
      pointRadius: 5,
      dash: "9 9"
    };
  }

  return {
    viewWidth: 1200,
    height: 260,
    top: 38,
    gridGap: 70,
    gridX1: 136,
    gridX2: 1160,
    plotLeft: 156,
    plotWidth: 960,
    plotHeight: 140,
    labelY: 232,
    fontSize: 14,
    plannedStroke: 5,
    actualStroke: 6,
    pointRadius: 7,
    dash: "12 12"
  };
}

function pointsFor(rows: { label: string; value: number }[], max: number, chart: ChartLayout) {
  const divisor = Math.max(rows.length - 1, 1);
  return rows.map((row, index) => ({
    label: row.label,
    x: rows.length === 1 ? chart.plotLeft + chart.plotWidth / 2 : chart.plotLeft + (chart.plotWidth * index) / divisor,
    y: chart.top + chart.plotHeight - (row.value / max) * chart.plotHeight
  }));
}

function pathFor(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

const styles = StyleSheet.create({
  embedded: { width: "100%", gap: theme.spacing.md },
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
    width: "100%",
    justifyContent: "center"
  },
  svg: {
    width: "100%"
  },
  empty: { color: theme.colors.muted, fontWeight: "700" }
});

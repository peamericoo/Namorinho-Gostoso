import { View } from "react-native";
import type { ExpenseGroup as ExpenseGroupData } from "../../lib/expenseFilters";
import type { Expense } from "../../types/models";
import { ExpenseGroup } from "./ExpenseGroup";

export function ExpenseList({
  groups,
  renderExpense
}: {
  groups: ExpenseGroupData[];
  renderExpense: (expense: Expense) => React.ReactNode;
}) {
  return (
    <View style={{ gap: 18 }}>
      {groups.map((group) => (
        <ExpenseGroup key={group.key} label={group.label} subtitle={group.subtitle} total={group.total} count={group.count} color={group.color}>
          {group.expenses.map(renderExpense)}
        </ExpenseGroup>
      ))}
    </View>
  );
}

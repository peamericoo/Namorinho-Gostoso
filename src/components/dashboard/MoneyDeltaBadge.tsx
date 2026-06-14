import { Badge } from "../ui/Badge";
import { money } from "../../lib/formatters";

export function MoneyDeltaBadge({ value }: { value: number }) {
  if (value < 0) {
    return <Badge label={`${money(Math.abs(value))} acima`} tone="danger" />;
  }
  if (value === 0) {
    return <Badge label="No limite" tone="warning" />;
  }
  return <Badge label={`${money(value)} livres`} tone="success" />;
}

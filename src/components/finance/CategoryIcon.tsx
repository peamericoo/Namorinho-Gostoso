import { CircleDollarSign, Gift, Heart, Home, Plane, Tag, Utensils } from "lucide-react-native";
import { View } from "react-native";

export function CategoryIcon({ icon, color = "#6C63B7", size = 22 }: { icon?: string; color?: string; size?: number }) {
  const props = { color, size };
  if (icon === "plane") return <Plane {...props} />;
  if (icon === "heart") return <Heart {...props} />;
  if (icon === "home") return <Home {...props} />;
  if (icon === "gift") return <Gift {...props} />;
  if (icon === "utensils") return <Utensils {...props} />;
  if (icon === "money") return <CircleDollarSign {...props} />;
  return (
    <View>
      <Tag {...props} />
    </View>
  );
}

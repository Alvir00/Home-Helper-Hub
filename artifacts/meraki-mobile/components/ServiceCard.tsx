import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Service } from "@workspace/api-client-react";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const ICONS: Record<string, FeatherIconName> = {
  cleaning: "wind",
  laundry: "loader",
  combined: "zap",
};

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  selected?: boolean;
}

export function ServiceCard({ service, onPress, selected }: ServiceCardProps) {
  const colors = useColors();
  const icon: FeatherIconName = ICONS[service.category] ?? "help-circle";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: selected
              ? "rgba(255,255,255,0.2)"
              : colors.accent,
          },
        ]}
      >
        <Feather name={icon} size={22} color={selected ? "#FFFFFF" : colors.primary} />
      </View>
      <Text
        style={[styles.name, { color: selected ? "#FFFFFF" : colors.foreground }]}
        numberOfLines={2}
      >
        {service.name}
      </Text>
      <Text
        style={[
          styles.price,
          { color: selected ? "rgba(255,255,255,0.8)" : colors.mutedForeground },
        ]}
      >
        {service.pricePerHour} ETB/hr
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 8,
    minHeight: 130,
    justifyContent: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  price: {
    fontSize: 11,
    textAlign: "center",
  },
});

import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Service } from "@workspace/api-client-react";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const CATEGORY_CONFIG: Record<string, { icon: FeatherIconName; lightBg: string; color: string }> = {
  cleaning: { icon: "wind",   lightBg: "#FEF3E8", color: "#C1622F" },
  laundry:  { icon: "loader", lightBg: "#EBF4FD", color: "#3B82F6" },
  combined: { icon: "zap",    lightBg: "#F0FDF4", color: "#16A34A" },
};

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  selected?: boolean;
}

export function ServiceCard({ service, onPress, selected }: ServiceCardProps) {
  const colors = useColors();
  const cat = CATEGORY_CONFIG[service.category] ?? CATEGORY_CONFIG.cleaning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* Icon block */}
      <View
        style={[
          styles.iconBlock,
          { backgroundColor: selected ? "rgba(255,255,255,0.2)" : cat.lightBg },
        ]}
      >
        <Feather
          name={cat.icon}
          size={22}
          color={selected ? "#FFFFFF" : cat.color}
        />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text
          style={[styles.name, { color: selected ? "#FFFFFF" : colors.foreground }]}
          numberOfLines={1}
        >
          {service.name}
        </Text>
        <Text
          style={[styles.meta, { color: selected ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}
        >
          {service.durationHours}h · {service.pricePerHour} ETB/hr
        </Text>
      </View>

      {/* Indicator */}
      <Feather
        name={selected ? "check-circle" : "chevron-right"}
        size={18}
        color={selected ? "#FFFFFF" : colors.mutedForeground}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  iconBlock: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontWeight: "400",
  },
});

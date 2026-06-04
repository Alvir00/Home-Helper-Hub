import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Booking } from "@workspace/api-client-react";

const STATUS_MAP: Record<string, { accent: string; bg: string; text: string; label: string }> = {
  pending:     { accent: "#F59E0B", bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  confirmed:   { accent: "#3B82F6", bg: "#DBEAFE", text: "#1D4ED8", label: "Confirmed" },
  in_progress: { accent: "#10B981", bg: "#D1FAE5", text: "#065F46", label: "In Progress" },
  completed:   { accent: "#6B7280", bg: "#F3F4F6", text: "#374151", label: "Completed" },
  cancelled:   { accent: "#EF4444", bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
};

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-US", opts);
}

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const colors = useColors();
  const s = STATUS_MAP[booking.status] ?? STATUS_MAP.pending;
  const date = new Date(booking.scheduledDate);

  return (
    <Pressable
      onPress={() => router.push(`/bookings/${booking.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* Left accent strip */}
      <View style={[styles.accentBar, { backgroundColor: s.accent }]} />

      {/* Date block */}
      <View style={[styles.dateBlock, { backgroundColor: `${s.accent}14` }]}>
        <Text style={[styles.dateDay, { color: s.accent }]}>
          {date.getDate()}
        </Text>
        <Text style={[styles.dateMonth, { color: s.accent }]}>
          {date.toLocaleDateString("en-US", { month: "short" })}
        </Text>
        <Text style={[styles.dateTime, { color: colors.mutedForeground }]}>
          {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.serviceName, { color: colors.foreground }]} numberOfLines={1}>
            {booking.service.name}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            {booking.totalPrice} ETB
          </Text>
        </View>

        <View style={styles.workerRow}>
          <Feather name="user" size={12} color={colors.mutedForeground} />
          <Text style={[styles.workerName, { color: colors.mutedForeground }]}>
            {booking.worker.name}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
        </View>
      </View>

      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
    gap: 12,
    paddingRight: 14,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  dateBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    minWidth: 52,
    gap: 1,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: "800",
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTime: {
    fontSize: 10,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    gap: 5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    fontFamily: "Inter_600SemiBold",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 0,
  },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  workerName: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
});

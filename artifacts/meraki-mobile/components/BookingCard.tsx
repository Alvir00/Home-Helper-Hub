import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Booking } from "@workspace/api-client-react";

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  pending:     { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  confirmed:   { bg: "#DBEAFE", text: "#1D4ED8", label: "Confirmed" },
  in_progress: { bg: "#D1FAE5", text: "#065F46", label: "In Progress" },
  completed:   { bg: "#F3F4F6", text: "#374151", label: "Completed" },
  cancelled:   { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
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

  return (
    <Pressable
      onPress={() => router.push(`/bookings/${booking.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
        </View>
        <Text style={[styles.price, { color: colors.primary }]}>
          {booking.totalPrice} ETB
        </Text>
      </View>
      <Text style={[styles.service, { color: colors.foreground }]}>
        {booking.service.name}
      </Text>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        with {booking.worker.name}
      </Text>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {fmt(booking.scheduledDate, { weekday: "short", month: "short", day: "numeric" })}
        {" at "}
        {new Date(booking.scheduledDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 4,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  price: { fontSize: 15, fontWeight: "700" },
  service: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13 },
});

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BookingCard } from "@/components/BookingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useListBookings, type Booking } from "@workspace/api-client-react";

type Tab = "upcoming" | "past";

const UPCOMING_STATUSES = ["pending", "confirmed", "in_progress"];
const PAST_STATUSES = ["completed", "cancelled"];

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useListBookings(undefined, {
    query: { enabled: !!user },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
          <Feather name="list" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your Bookings</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Sign in to view and manage your bookings.
        </Text>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const bookings = data?.bookings ?? [];

  const filtered = bookings.filter((b: Booking) =>
    activeTab === "upcoming"
      ? UPCOMING_STATUSES.includes(b.status)
      : PAST_STATUSES.includes(b.status)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Bookings</Text>

        {/* Tab toggle */}
        <View style={[styles.tabToggle, { backgroundColor: colors.secondary }]}>
          {(["upcoming", "past"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                activeTab === tab && {
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color: activeTab === tab ? colors.foreground : colors.mutedForeground,
                    fontWeight: activeTab === tab ? "600" : "400",
                  },
                ]}
              >
                {tab === "upcoming" ? "Upcoming" : "History"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather
                name={activeTab === "upcoming" ? "calendar" : "clock"}
                size={40}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>
                {activeTab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>
                {activeTab === "upcoming"
                  ? "Book a service to get started."
                  : "Your completed bookings will appear here."}
              </Text>
              {activeTab === "upcoming" && (
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 8 }]}
                  onPress={() => router.push("/(tabs)/book")}
                >
                  <Text style={styles.primaryBtnText}>Book Now</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filtered.map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  tabToggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabBtnText: { fontSize: 14 },
  scroll: { padding: 16 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyStateTitle: { fontSize: 17, fontWeight: "600", marginTop: 12 },
  emptyStateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});

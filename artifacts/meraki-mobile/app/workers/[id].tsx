import { AntDesign, Feather } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarRating } from "@/components/StarRating";
import { useColors } from "@/hooks/useColors";
import { useGetWorker, useGetWorkerReviews } from "@workspace/api-client-react";

function Avatar({ name, size = 80, bg }: { name: string; size?: number; bg: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: size * 0.36, fontWeight: "700" }}>
        {initials}
      </Text>
    </View>
  );
}

export default function WorkerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workerId = parseInt(id ?? "0", 10);

  const { data: worker, isLoading } = useGetWorker(workerId);
  const { data: reviews } = useGetWorkerReviews(workerId);

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Worker not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: worker.name,
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.foreground, fontWeight: "700" },
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile hero */}
          <View style={styles.heroSection}>
            <Avatar name={worker.name} bg={colors.primary} size={88} />
            <Text style={[styles.workerName, { color: colors.foreground }]}>{worker.name}</Text>
            {worker.rating != null && worker.rating > 0 ? (
              <View style={styles.ratingRow}>
                <StarRating rating={worker.rating} size={16} />
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                  {worker.rating.toFixed(1)} ({worker.totalReviews} reviews)
                </Text>
              </View>
            ) : (
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                New helper
              </Text>
            )}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {worker.completedBookings}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Bookings</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {worker.rating ? worker.rating.toFixed(1) : "—"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Rating</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {worker.services.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Services</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          {worker.bio && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.bio, { color: colors.mutedForeground }]}>{worker.bio}</Text>
            </View>
          )}

          {/* Services */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Services</Text>
            {worker.services.map((service) => (
              <View
                key={service.id}
                style={[styles.serviceRow, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.serviceIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="zap" size={14} color={colors.primary} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.foreground }]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.serviceMeta, { color: colors.mutedForeground }]}>
                    {service.pricePerHour} ETB/hr · {service.durationHours}h
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Reviews */}
          {(reviews ?? []).length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Reviews</Text>
              {reviews!.map((review) => (
                <View key={review.id} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.reviewHeader}>
                    <StarRating rating={review.rating} size={13} />
                    <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text style={[styles.reviewComment, { color: colors.foreground }]}>
                      {review.comment}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Book button */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: bottomPad + 12,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => router.push("/(tabs)/book")}
            style={({ pressed }) => [
              styles.bookBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Feather name="calendar" size={18} color="#FFFFFF" />
            <Text style={styles.bookBtnText}>Book {worker.name.split(" ")[0]}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },
  heroSection: { alignItems: "center", paddingVertical: 24, gap: 10 },
  workerName: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingText: { fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 2,
  },
  statNum: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  bio: { fontSize: 14, lineHeight: 22 },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "600" },
  serviceMeta: { fontSize: 12, marginTop: 2 },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 14, lineHeight: 20 },
  bottomBar: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  bookBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});

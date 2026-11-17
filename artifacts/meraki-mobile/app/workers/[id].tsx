import { Feather } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

import { WorkerAvatar } from "@/components/WorkerCard";
import { StarRating } from "@/components/StarRating";
import { useColors } from "@/hooks/useColors";
import {
  getListWorkersQueryKey,
  useGetWorker,
  useGetWorkerReviews,
  useListWorkers,
} from "@workspace/api-client-react";

const AVAILABILITY_DATES = Array.from({ length: 5 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return d;
});

function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function WorkerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workerId = parseInt(id ?? "0", 10);

  const { data: worker, isLoading } = useGetWorker(workerId);
  const { data: reviews } = useGetWorkerReviews(workerId);

  // Check availability for the next 5 days by querying workers with this service
  const [checkedDate, setCheckedDate] = useState<Date>(AVAILABILITY_DATES[0]);
  const workerParams = {
    serviceId: worker?.services[0]?.id,
    date: toISO(checkedDate),
  };
  const { data: availabilityData, isFetching: availChecking } = useListWorkers(workerParams, {
    query: {
      enabled: !!worker && worker.services.length > 0,
      queryKey: getListWorkersQueryKey(workerParams),
    },
  });

  const isAvailableOnDate =
    availabilityData?.workers.some((w) => w.id === workerId) ?? false;

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

  const isApproved = worker.status === "approved";

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
            <WorkerAvatar
              name={worker.name}
              photoUrl={worker.photoUrl}
              bg={colors.primary}
              size={96}
            />
            <Text style={[styles.workerName, { color: colors.foreground }]}>{worker.name}</Text>

            {/* Availability status badge */}
            <View
              style={[
                styles.availBadge,
                {
                  backgroundColor: isApproved ? "#D1FAE5" : "#FEE2E2",
                },
              ]}
            >
              <View
                style={[
                  styles.availDot,
                  { backgroundColor: isApproved ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text
                style={[
                  styles.availText,
                  { color: isApproved ? "#065F46" : "#991B1B" },
                ]}
              >
                {isApproved ? "Taking bookings" : "Not available"}
              </Text>
            </View>

            {worker.rating != null && worker.rating > 0 ? (
              <View style={styles.ratingRow}>
                <StarRating rating={worker.rating} size={16} />
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                  {worker.rating.toFixed(1)} ({worker.totalReviews} reviews)
                </Text>
              </View>
            ) : (
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                New helper · no reviews yet
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
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.bio, { color: colors.mutedForeground }]}>{worker.bio}</Text>
            </View>
          )}

          {/* Availability checker */}
          {isApproved && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Check Availability</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}
              >
                {AVAILABILITY_DATES.map((d) => {
                  const sel = toISO(checkedDate) === toISO(d);
                  return (
                    <Pressable
                      key={toISO(d)}
                      onPress={() => setCheckedDate(d)}
                      style={[
                        styles.dateChip,
                        {
                          backgroundColor: sel ? colors.primary : colors.accent,
                          borderRadius: colors.radius / 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipDay,
                          { color: sel ? "rgba(255,255,255,0.8)" : colors.mutedForeground },
                        ]}
                      >
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </Text>
                      <Text
                        style={[
                          styles.dateChipNum,
                          { color: sel ? "#FFFFFF" : colors.foreground },
                        ]}
                      >
                        {d.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.availResult}>
                {availChecking ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <View style={styles.availResultInner}>
                    <View
                      style={[
                        styles.availResultDot,
                        {
                          backgroundColor: isAvailableOnDate ? "#10B981" : "#F59E0B",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.availResultText,
                        {
                          color: isAvailableOnDate
                            ? colors.foreground
                            : colors.mutedForeground,
                        },
                      ]}
                    >
                      {isAvailableOnDate
                        ? `Available on ${checkedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
                        : `Not available on ${checkedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Services */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Services</Text>
            {worker.services.map((service, i) => (
              <View
                key={service.id}
                style={[
                  styles.serviceRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: i < worker.services.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View style={[styles.serviceIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="zap" size={14} color={colors.primary} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.foreground }]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.serviceMeta, { color: colors.mutedForeground }]}>
                    {service.pricePerHour} ETB/hr · {service.durationHours}h session
                  </Text>
                </View>
                <Text style={[styles.serviceTotal, { color: colors.primary }]}>
                  {(service.pricePerHour * service.durationHours).toFixed(0)} ETB
                </Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          {(reviews ?? []).length > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Reviews ({reviews!.length})
              </Text>
              {reviews!.map((review, i) => (
                <View
                  key={review.id}
                  style={[
                    styles.reviewItem,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: i < reviews!.length - 1 ? 1 : 0,
                    },
                  ]}
                >
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
        {isApproved && (
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
        )}
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
  availBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  availDot: { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 12, fontWeight: "600" },
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
  dateScroll: { marginBottom: 4 },
  dateChip: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    gap: 2,
  },
  dateChipDay: { fontSize: 11, fontWeight: "600" },
  dateChipNum: { fontSize: 18, fontWeight: "700" },
  availResult: { marginTop: 4, minHeight: 28, justifyContent: "center" },
  availResultInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  availResultDot: { width: 8, height: 8, borderRadius: 4 },
  availResultText: { fontSize: 14, fontWeight: "500" },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
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
  serviceTotal: { fontSize: 13, fontWeight: "700" },
  reviewItem: {
    paddingVertical: 10,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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

import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StarRating } from "@/components/StarRating";
import { useColors } from "@/hooks/useColors";
import {
  useGetBooking,
  useUpdateBookingStatus,
  useReviewBooking,
} from "@workspace/api-client-react";

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  pending:     { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  confirmed:   { bg: "#DBEAFE", text: "#1D4ED8", label: "Confirmed" },
  in_progress: { bg: "#D1FAE5", text: "#065F46", label: "In Progress" },
  completed:   { bg: "#F3F4F6", text: "#374151", label: "Completed" },
  cancelled:   { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
};

export default function BookingDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = parseInt(id ?? "0", 10);

  const { data: booking, isLoading, refetch } = useGetBooking(bookingId);
  const updateStatus = useUpdateBookingStatus();
  const reviewBooking = useReviewBooking();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Booking not found.</Text>
      </View>
    );
  }

  const statusInfo = STATUS_MAP[booking.status] ?? STATUS_MAP.pending;

  const handleCancel = () => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Cancel Booking",
        style: "destructive",
        onPress: async () => {
          try {
            await updateStatus.mutateAsync({
              id: bookingId,
              data: { status: "cancelled" },
            });
            await refetch();
          } catch {
            Alert.alert("Error", "Failed to cancel booking.");
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    try {
      await reviewBooking.mutateAsync({
        id: bookingId,
        data: { rating: reviewRating, comment: reviewComment.trim() || undefined },
      });
      setShowReviewForm(false);
      await refetch();
    } catch {
      Alert.alert("Error", "Failed to submit review.");
    }
  };

  const formattedDate = new Date(booking.scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = new Date(booking.scheduledDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Booking Detail",
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.foreground, fontWeight: "700" },
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Status badge */}
          <View style={styles.statusRow}>
            <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={[styles.bookingId, { color: colors.mutedForeground }]}>
              #{booking.id}
            </Text>
          </View>

          {/* Main card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <InfoRow
              icon="zap"
              label="Service"
              value={booking.service.name}
              colors={colors}
            />
            <InfoRow
              icon="user"
              label="Helper"
              value={booking.worker.name}
              colors={colors}
            />
            <InfoRow
              icon="calendar"
              label="Date"
              value={formattedDate}
              colors={colors}
            />
            <InfoRow
              icon="clock"
              label="Time"
              value={formattedTime}
              colors={colors}
            />
            <InfoRow
              icon="map-pin"
              label="Address"
              value={booking.address}
              colors={colors}
            />
            {booking.notes && (
              <InfoRow
                icon="file-text"
                label="Notes"
                value={booking.notes}
                colors={colors}
              />
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Total</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                {booking.totalPrice} ETB
              </Text>
            </View>
          </View>

          {/* Review section */}
          {booking.status === "completed" && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Review</Text>
              {booking.review ? (
                <View style={styles.existingReview}>
                  <StarRating rating={booking.review.rating} size={16} />
                  {booking.review.comment && (
                    <Text style={[styles.reviewComment, { color: colors.foreground }]}>
                      "{booking.review.comment}"
                    </Text>
                  )}
                </View>
              ) : showReviewForm ? (
                <View style={styles.reviewForm}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                    Your rating
                  </Text>
                  <View style={styles.ratingPicker}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setReviewRating(star)}>
                        <Feather
                          name="star"
                          size={28}
                          color={star <= reviewRating ? "#F59E0B" : colors.border}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
                    Comment (optional)
                  </Text>
                  <TextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Share your experience..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.reviewInput,
                      { borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius / 2 },
                    ]}
                  />
                  <View style={styles.reviewBtns}>
                    <Pressable
                      onPress={() => setShowReviewForm(false)}
                      style={[styles.cancelBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSubmitReview}
                      style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    >
                      {reviewBooking.isPending ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.submitBtnText}>Submit</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowReviewForm(true)}
                  style={[styles.leaveReviewBtn, { borderColor: colors.primary }]}
                >
                  <Feather name="star" size={16} color={colors.primary} />
                  <Text style={[styles.leaveReviewText, { color: colors.primary }]}>
                    Leave a Review
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Cancel button */}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <Pressable
              onPress={handleCancel}
              style={[styles.cancelBookingBtn, { borderColor: colors.destructive }]}
            >
              {updateStatus.isPending ? (
                <ActivityIndicator color={colors.destructive} size="small" />
              ) : (
                <>
                  <Feather name="x-circle" size={16} color={colors.destructive} />
                  <Text style={[styles.cancelBookingText, { color: colors.destructive }]}>
                    Cancel Booking
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>
      </View>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={16} color={colors.primary} style={{ marginTop: 2 }} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  bookingId: { fontSize: 13 },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    gap: 14,
  },
  infoRow: { flexDirection: "row", gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: "500" },
  infoValue: { fontSize: 15, marginTop: 2 },
  divider: { height: 1 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14, fontWeight: "500" },
  priceValue: { fontSize: 22, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  existingReview: { gap: 8 },
  reviewComment: { fontSize: 14, lineHeight: 20, fontStyle: "italic" },
  reviewForm: { gap: 10 },
  fieldLabel: { fontSize: 12, fontWeight: "600" },
  ratingPicker: { flexDirection: "row", gap: 8 },
  reviewInput: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    height: 80,
    textAlignVertical: "top",
  },
  reviewBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  cancelBtnText: { fontWeight: "600" },
  submitBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontWeight: "700" },
  leaveReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  leaveReviewText: { fontWeight: "600", fontSize: 14 },
  cancelBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelBookingText: { fontWeight: "600", fontSize: 15 },
});

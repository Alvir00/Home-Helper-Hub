import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StarRating } from "@/components/StarRating";
import { useColors } from "@/hooks/useColors";
import type { Worker } from "@workspace/api-client-react";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  bg: string;
}

export function WorkerAvatar({ name, photoUrl, size = 56, bg }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }}
        contentFit="cover"
        transition={200}
      />
    );
  }

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

interface WorkerCardProps {
  worker: Worker;
  onBook?: () => void;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export function WorkerCard({
  worker,
  onBook,
  selected,
  onSelect,
  compact = false,
}: WorkerCardProps) {
  const colors = useColors();
  const rating = worker.rating ?? 0;

  const handlePress = () => {
    if (onSelect) {
      onSelect();
    } else {
      router.push(`/workers/${worker.id}`);
    }
  };

  const avatarSize = compact ? 44 : 56;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? `${colors.primary}12` : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <WorkerAvatar
          name={worker.name}
          photoUrl={worker.photoUrl}
          bg={colors.primary}
          size={avatarSize}
        />
        {selected && (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={10} color="#FFF" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{worker.name}</Text>

        <View style={styles.ratingRow}>
          {rating > 0 ? (
            <>
              <StarRating rating={rating} size={11} />
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                {rating.toFixed(1)} ({worker.totalReviews})
              </Text>
            </>
          ) : (
            <Text style={[styles.newBadge, { color: colors.primary }]}>New helper</Text>
          )}
        </View>

        {!compact && (
          <View style={styles.metaRow}>
            <View style={[styles.jobsChip, { backgroundColor: `${colors.primary}12` }]}>
              <Text style={[styles.jobsText, { color: colors.primary }]}>
                {worker.completedBookings} jobs
              </Text>
            </View>
            {worker.services.length > 0 && (
              <Text
                style={[styles.services, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {worker.services.slice(0, 2).map((s) => s.name).join(" · ")}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Action */}
      {onBook ? (
        <Pressable
          onPress={onBook}
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.bookBtnText}>Book</Text>
        </Pressable>
      ) : !selected ? (
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  selectedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 12 },
  newBadge: { fontSize: 12, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" },
  jobsChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  jobsText: { fontSize: 11, fontWeight: "600" },
  services: { fontSize: 11, flex: 1 },
  bookBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  bookBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});

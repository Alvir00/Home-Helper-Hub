import { AntDesign, Feather } from "@expo/vector-icons";
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

export function WorkerAvatar({ name, photoUrl, size = 48, bg }: AvatarProps) {
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

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.accent : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <WorkerAvatar
        name={worker.name}
        photoUrl={worker.photoUrl}
        bg={colors.primary}
        size={compact ? 40 : 48}
      />
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
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>New helper</Text>
          )}
        </View>
        {!compact && (
          <Text style={[styles.services, { color: colors.mutedForeground }]} numberOfLines={1}>
            {worker.services.map((s) => s.name).join(" · ")}
          </Text>
        )}
      </View>
      {onBook && (
        <Pressable
          onPress={onBook}
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.bookBtnText}>Book</Text>
        </Pressable>
      )}
      {selected && !onBook && (
        <Feather name="check-circle" size={22} color={colors.primary} />
      )}
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
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 12 },
  services: { fontSize: 12 },
  bookBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  bookBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});

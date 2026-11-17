import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StarRatingProps {
  rating: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export function StarRating({
  rating,
  size = 13,
  activeColor = "#F59E0B",
  inactiveColor = "#D4C9B8",
}: StarRatingProps) {
  const rounded = Math.round(rating);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <AntDesign
          key={i}
          name="star"
          size={size}
          color={i <= rounded ? activeColor : inactiveColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});

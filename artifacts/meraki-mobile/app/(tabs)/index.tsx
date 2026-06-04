import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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

import { WorkerCard } from "@/components/WorkerCard";
import { ServiceCard } from "@/components/ServiceCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useListServices, useListWorkers, type Service } from "@workspace/api-client-react";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: services, isLoading: servLoading, refetch: refetchServices } = useListServices();
  const { data: workersData, isLoading: workersLoading, refetch: refetchWorkers } =
    useListWorkers({ limit: 4 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchServices(), refetchWorkers()]);
    setRefreshing(false);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={[colors.primary, "#A84E24"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.logoText}>meraki</Text>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(" ")[0]} 👋` : "Welcome back"}
            </Text>
          </View>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>Addis Ababa</Text>
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Your home, perfectly kept.</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { icon: "home" as const,  value: "500+",  label: "Homes" },
            { icon: "star" as const,  value: "4.8★",  label: "Rating" },
            { icon: "users" as const, value: "15+",   label: "Areas" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < 2 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Book CTA */}
        <Pressable
          onPress={() => router.push("/(tabs)/book")}
          style={({ pressed }) => [
            styles.ctaCard,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View>
            <Text style={styles.ctaTitle}>Book a Service</Text>
            <Text style={styles.ctaSubtitle}>Available today from 8:00 AM</Text>
          </View>
          <View style={styles.ctaArrow}>
            <Feather name="arrow-right" size={20} color={colors.primary} />
          </View>
        </Pressable>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Our Services</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Tap to book instantly
              </Text>
            </View>
          </View>

          {servLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <View>
              {(services ?? []).map((service: Service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => router.push("/(tabs)/book")}
                />
              ))}
            </View>
          )}
        </View>

        {/* Top Helpers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Helpers</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Background-checked & rated
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/book")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>

          {workersLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : (workersData?.workers ?? []).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No helpers available right now.
            </Text>
          ) : (
            (workersData?.workers ?? []).map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },
  greeting: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  tagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  /* Scroll */
  scroll: { padding: 16, gap: 4 },

  /* CTA Card */
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    marginBottom: 20,
  },
  ctaTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  ctaSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Section */
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAll: { fontSize: 14, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 16 },
});

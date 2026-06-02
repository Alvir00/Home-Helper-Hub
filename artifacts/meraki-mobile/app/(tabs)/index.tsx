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
    useListWorkers({ limit: 6 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchServices(), refetchWorkers()]);
    setRefreshing(false);
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, "#A84E24"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.logoText}>meraki</Text>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome back"}
            </Text>
          </View>
          <View style={styles.locationPill}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>Addis Ababa</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Your home, perfectly kept.</Text>
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
        {/* Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Our Services</Text>
          {servLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.servicesGrid}>
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

        {/* Featured Helpers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Helpers</Text>
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

      {/* Floating Book Button */}
      <View
        style={[
          styles.fab,
          {
            bottom: insets.bottom + (Platform.OS === "web" ? 84 : 16),
          },
        ]}
      >
        <Pressable
          onPress={() => router.push("/(tabs)/book")}
          style={({ pressed }) => [
            styles.fabBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.fabText}>Book a Service</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },
  greeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  tagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
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
  scroll: { padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: "Inter_700Bold",
  },
  seeAll: { fontSize: 14, fontWeight: "600" },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 16 },
  fab: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  fabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#C1622F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});

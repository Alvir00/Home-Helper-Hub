import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useGetMe, useUpdateMe, useGetCurrentSubscription } from "@workspace/api-client-react";

function Avatar({ name, size = 72, bg }: { name: string; size?: number; bg: string }) {
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  const { data: me } = useGetMe({ query: { enabled: !!user } });
  const { data: sub } = useGetCurrentSubscription({ query: { enabled: !!user } });
  const updateMe = useUpdateMe();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent }]}>
          <Feather name="user" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your Profile</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Sign in to manage your account and view your subscription.
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

  const displayUser = me ?? user;

  const handleSave = async () => {
    try {
      const updated = await updateMe.mutateAsync({
        data: {
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
      });
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as "household" | "admin",
        phone: updated.phone,
        address: updated.address,
      });
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <Pressable
          onPress={() => {
            if (editing) {
              setName(displayUser.name);
              setPhone(displayUser.phone ?? "");
              setAddress(displayUser.address ?? "");
            }
            setEditing(!editing);
          }}
        >
          <Text style={[styles.editBtn, { color: colors.primary }]}>
            {editing ? "Cancel" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <Avatar name={displayUser.name} bg={colors.primary} />
          <Text style={[styles.userName, { color: colors.foreground }]}>{displayUser.name}</Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
            {displayUser.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>
              {displayUser.role === "admin" ? "Administrator" : "Household"}
            </Text>
          </View>
        </View>

        {/* Subscription card */}
        {sub && (
          <View
            style={[
              styles.subCard,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
          >
            <View>
              <Text style={styles.subPlanName}>{sub.plan.name}</Text>
              <Text style={styles.subMeta}>
                {sub.bookingsUsed} / {sub.plan.bookingsPerMonth} bookings used
              </Text>
            </View>
            <View style={styles.subRight}>
              <Text style={styles.subPrice}>{sub.plan.priceMonthly} ETB</Text>
              <Text style={styles.subPer}>/month</Text>
            </View>
          </View>
        )}

        {/* Info fields */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Account Details
          </Text>

          {editing ? (
            <View style={styles.form}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius / 2 },
                  ]}
                />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius / 2 },
                  ]}
                />
              </View>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius / 2 },
                  ]}
                />
              </View>
              <Pressable
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                {updateMe.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.infoList}>
              {[
                { icon: "mail" as const, label: "Email", value: displayUser.email },
                { icon: "phone" as const, label: "Phone", value: displayUser.phone || "Not set" },
                { icon: "map-pin" as const, label: "Address", value: displayUser.address || "Not set" },
              ].map((row) => (
                <View key={row.label} style={styles.infoRow}>
                  <Feather name={row.icon} size={16} color={colors.primary} />
                  <View style={styles.infoText}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.foreground }]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={handleLogout}
          style={[styles.logoutBtn, { borderColor: colors.destructive }]}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  editBtn: { fontSize: 15, fontWeight: "600" },
  scroll: { padding: 16, gap: 16 },
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  userName: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 14 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: "600" },
  subCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  subPlanName: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  subMeta: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  subRight: { alignItems: "flex-end" },
  subPrice: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  subPer: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  card: { padding: 16, borderWidth: 1, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  form: { gap: 14 },
  formField: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  infoList: { gap: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
  },
  logoutText: { fontWeight: "600", fontSize: 15 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
});

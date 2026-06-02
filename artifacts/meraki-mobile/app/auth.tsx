import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { useLogin, useRegister } from "@workspace/api-client-react";

type Mode = "login" | "register";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      let result;
      if (mode === "login") {
        result = await loginMutation.mutateAsync({
          data: { email: email.trim(), password },
        });
      } else {
        result = await registerMutation.mutateAsync({
          data: {
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim() || undefined,
          },
        });
      }
      await login(result.token, {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as "household" | "admin",
        phone: result.user.phone,
        address: result.user.address,
      });
      router.back();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : mode === "login" ? "Invalid email or password." : "Registration failed.";
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Feather name="home" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.foreground }]}>meraki</Text>
          <Text style={[styles.logoSubtext, { color: colors.mutedForeground }]}>
            Home services, simplified
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.secondary }]}>
          {(["login", "register"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setError(null);
              }}
              style={[
                styles.modeBtn,
                mode === m && {
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  {
                    color: mode === m ? colors.foreground : colors.mutedForeground,
                    fontWeight: mode === m ? "600" : "400",
                  },
                ]}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "register" && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius / 2 },
                ]}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius / 2 },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius / 2 },
              ]}
            />
          </View>

          {mode === "register" && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Phone (optional)
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+251 9XX XXX XXX"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, borderRadius: colors.radius / 2 },
                ]}
              />
            </View>
          )}

          {error && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          )}

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </Pressable>

          {mode === "login" && (
            <Text style={[styles.demoHint, { color: colors.mutedForeground }]}>
              Demo: alemu@example.com / user123
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 8,
  },
  logoSection: { alignItems: "center", marginBottom: 32, gap: 8 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },
  logoSubtext: { fontSize: 14 },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 28,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeBtnText: { fontSize: 14 },
  form: { gap: 16 },
  field: { gap: 7 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  errorText: { fontSize: 13 },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  demoHint: { fontSize: 12, textAlign: "center", marginTop: 4 },
});

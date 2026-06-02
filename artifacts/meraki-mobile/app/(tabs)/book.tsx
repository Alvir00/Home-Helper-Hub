import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ServiceCard } from "@/components/ServiceCard";
import { WorkerCard } from "@/components/WorkerCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import {
  useCreateBooking,
  useListServices,
  useListWorkers,
  type Service,
  type Worker,
} from "@workspace/api-client-react";

type Step = 0 | 1 | 2 | 3;
const STEP_LABELS = ["Service", "Date & Time", "Helper", "Confirm"];
const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"];

function getDates(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function BookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [address, setAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: services, isLoading: servLoading } = useListServices();
  const { data: workersData, isLoading: workersLoading } = useListWorkers(
    step === 2 && selectedService && selectedDate
      ? { serviceId: selectedService.id, date: toISO(selectedDate) }
      : undefined,
    { query: { enabled: step === 2 && !!selectedService && !!selectedDate } }
  );

  const createBooking = useCreateBooking();
  const dates = useMemo(() => getDates(7), []);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
          <Feather name="calendar" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to Book</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Log in to book a cleaning or laundry service.
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

  if (submitted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.successCircle, { backgroundColor: colors.accent }]}>
          <Feather name="check" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Your {selectedService?.name} with {selectedWorker?.name} is scheduled.
        </Text>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setSubmitted(false);
            setStep(0);
            setSelectedService(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setSelectedWorker(null);
            setAddress(user?.address ?? "");
            setNotes("");
            router.push("/(tabs)/bookings");
          }}
        >
          <Text style={styles.primaryBtnText}>View My Bookings</Text>
        </Pressable>
      </View>
    );
  }

  const canNext =
    (step === 0 && !!selectedService) ||
    (step === 1 && !!selectedDate && !!selectedTime) ||
    (step === 2 && !!selectedWorker);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedWorker || !address) return;
    setError(null);
    const scheduledDate = new Date(selectedDate);
    const [h, m] = selectedTime.split(":");
    scheduledDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    try {
      await createBooking.mutateAsync({
        data: {
          serviceId: selectedService.id,
          workerId: selectedWorker.id,
          scheduledDate: scheduledDate.toISOString(),
          address,
          notes: notes.trim() || undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Booking failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header + Step indicator */}
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book a Service</Text>
        <View style={styles.stepRow}>
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={label}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    { backgroundColor: i <= step ? colors.primary : colors.border },
                  ]}
                >
                  {i < step ? (
                    <Feather name="check" size={11} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNum,
                        { color: i === step ? "#FFF" : colors.mutedForeground },
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: i <= step ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {label}
                </Text>
              </View>
              {i < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: i < step ? colors.primary : colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Service */}
        {step === 0 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What do you need?
            </Text>
            {servLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            ) : (
              <View style={styles.servicesGrid}>
                {(services ?? []).map((service: Service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedService?.id === service.id}
                    onPress={() => {
                      setSelectedService(service);
                      Haptics.selectionAsync();
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Pick a date and time
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => {
                const iso = toISO(d);
                const sel = selectedDate !== null && toISO(selectedDate) === iso;
                return (
                  <Pressable
                    key={iso}
                    onPress={() => {
                      setSelectedDate(d);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.dateCard,
                      {
                        backgroundColor: sel ? colors.primary : colors.card,
                        borderColor: sel ? colors.primary : colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        { color: sel ? "rgba(255,255,255,0.8)" : colors.mutedForeground },
                      ]}
                    >
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </Text>
                    <Text
                      style={[styles.dayNum, { color: sel ? "#FFFFFF" : colors.foreground }]}
                    >
                      {d.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.dayMonth,
                        { color: sel ? "rgba(255,255,255,0.7)" : colors.mutedForeground },
                      ]}
                    >
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
              Time
            </Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((t) => {
                const sel = selectedTime === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setSelectedTime(t);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.timeChip,
                      {
                        backgroundColor: sel ? colors.primary : colors.card,
                        borderColor: sel ? colors.primary : colors.border,
                        borderRadius: colors.radius / 2,
                      },
                    ]}
                  >
                    <Text style={[styles.timeText, { color: sel ? "#FFFFFF" : colors.foreground }]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2: Worker */}
        {step === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose your helper</Text>
            {workersLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            ) : (workersData?.workers ?? []).length === 0 ? (
              <View style={[styles.center, { paddingTop: 32 }]}>
                <Feather name="user-x" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground, marginTop: 8 }]}>
                  No helpers available for this date
                </Text>
              </View>
            ) : (
              (workersData?.workers ?? []).map((w: Worker) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  selected={selectedWorker?.id === w.id}
                  onSelect={() => {
                    setSelectedWorker(w);
                    Haptics.selectionAsync();
                  }}
                />
              ))
            )}
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirm booking</Text>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              {[
                { label: "Service", value: selectedService?.name ?? "" },
                {
                  label: "Date",
                  value: selectedDate
                    ? `${selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${selectedTime}`
                    : "",
                },
                { label: "Helper", value: selectedWorker?.name ?? "" },
                {
                  label: "Price",
                  value: selectedService
                    ? `${(selectedService.pricePerHour * selectedService.durationHours).toFixed(0)} ETB`
                    : "",
                  accent: true,
                },
              ].map((row, i, arr) => (
                <React.Fragment key={row.label}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                      {row.label}
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: row.accent ? colors.primary : colors.foreground },
                        row.accent && { fontWeight: "700" },
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                  {i < arr.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
              Address *
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Your address in Addis Ababa..."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  borderRadius: colors.radius / 2,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 14 }]}>
              Notes (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.textarea,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  borderRadius: colors.radius / 2,
                },
              ]}
            />

            {error && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomBar,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        {step > 0 ? (
          <Pressable
            onPress={handleBack}
            style={[styles.backBtn, { borderColor: colors.border }]}
          >
            <Feather name="chevron-left" size={18} color={colors.foreground} />
            <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}

        {step < 3 ? (
          <Pressable
            onPress={canNext ? handleNext : undefined}
            style={[
              styles.nextBtn,
              { backgroundColor: canNext ? colors.primary : colors.muted },
            ]}
          >
            <Text
              style={[
                styles.nextBtnText,
                { color: canNext ? "#FFFFFF" : colors.mutedForeground },
              ]}
            >
              {step === 2 ? "Review" : "Continue"}
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={canNext ? "#FFFFFF" : colors.mutedForeground}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={address.trim().length > 0 ? handleSubmit : undefined}
            style={[
              styles.nextBtn,
              {
                backgroundColor:
                  address.trim().length > 0 ? colors.primary : colors.muted,
              },
            ]}
          >
            {createBooking.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextBtnText}>Confirm Booking</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    fontFamily: "Inter_700Bold",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 9, fontWeight: "600" },
  stepLine: { flex: 1, height: 1.5, marginBottom: 14 },
  scroll: { flex: 1 },
  stepTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: "Inter_700Bold",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
  dateScroll: { marginBottom: 4 },
  dateCard: {
    alignItems: "center",
    padding: 12,
    borderWidth: 1.5,
    marginRight: 10,
    minWidth: 66,
  },
  dayName: { fontSize: 11, fontWeight: "600" },
  dayNum: { fontSize: 22, fontWeight: "700", marginVertical: 2 },
  dayMonth: { fontSize: 10 },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
  },
  timeText: { fontSize: 14, fontWeight: "600" },
  summaryCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1 },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  errorText: { fontSize: 13, marginTop: 12 },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  backBtnText: { fontWeight: "600", fontSize: 15 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});

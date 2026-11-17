/**
 * Booking status rules.
 *
 * The previous implementation accepted any status from any authenticated owner,
 * so a household could mark its own job `completed` — which increments the
 * worker's completed count and unlocks a review. Transitions now live here and
 * are enforced in `routes/bookings.ts`.
 */

export type BookingStatusValue =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

/** Statuses that still hold a worker's time slot. */
export const ACTIVE_BOOKING_STATUSES: BookingStatusValue[] = [
  "pending",
  "confirmed",
  "in_progress",
];

/** Statuses an administrator may move a booking to, keyed by current status. */
const ADMIN_TRANSITIONS: Record<BookingStatusValue, BookingStatusValue[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  // Terminal states: reopening a delivered or cancelled job would corrupt
  // worker statistics, so those require a new booking.
  completed: [],
  cancelled: [],
};

/**
 * A household may only cancel, and only while the job has not started. Every
 * other transition is an operational decision and belongs to an administrator.
 */
const HOUSEHOLD_TRANSITIONS: Record<BookingStatusValue, BookingStatusValue[]> = {
  pending: ["cancelled"],
  confirmed: ["cancelled"],
  in_progress: [],
  completed: [],
  cancelled: [],
};

export function allowedTransitions(
  from: BookingStatusValue,
  isAdmin: boolean,
): BookingStatusValue[] {
  return isAdmin ? ADMIN_TRANSITIONS[from] : HOUSEHOLD_TRANSITIONS[from];
}

export function canTransition(
  from: BookingStatusValue,
  to: BookingStatusValue,
  isAdmin: boolean,
): boolean {
  return allowedTransitions(from, isAdmin).includes(to);
}

/** True when a household is allowed to set this status at all. */
export function householdMaySet(to: BookingStatusValue): boolean {
  return to === "cancelled";
}

const HOUR_MS = 60 * 60 * 1000;

/** Half-open interval overlap test: [startA, endA) vs [startB, endB). */
export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

export function bookingEndMs(scheduledDate: Date, durationHours: number): number {
  return scheduledDate.getTime() + durationHours * HOUR_MS;
}

/** How far around a requested slot we must load neighbouring bookings from. */
export const OVERLAP_SCAN_WINDOW_MS = 24 * HOUR_MS;

/** Reject slots that are already in the past, tolerating a small clock skew. */
export const SCHEDULED_DATE_SKEW_MS = 60 * 1000;

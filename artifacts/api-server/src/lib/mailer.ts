import { logger } from "./logger";

interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function fromAddress(): string {
  // Compose passes an empty string when the variable is unset, which Resend
  // rejects. Treat blank as unset so a key alone still sends from the sandbox
  // sender until a verified domain is configured.
  const configured = process.env["MAIL_FROM"]?.trim();
  return configured || "Meraki <onboarding@resend.dev>";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends transactional mail through Resend when `RESEND_API_KEY` is set and
 * logs instead otherwise, so local and self-hosted setups work without an
 * account. Deliberately dependency-free (global `fetch`); swap the transport
 * here if you prefer SES or Postmark.
 *
 * Returns `delivered: false` rather than throwing: a mail outage must not turn
 * "request a reset link" into a 500 that tells an attacker the address exists.
 */
export async function sendMail(message: MailMessage): Promise<{ delivered: boolean }> {
  const apiKey = process.env["RESEND_API_KEY"];

  if (!apiKey) {
    logger.warn(
      { subject: message.subject },
      "No RESEND_API_KEY configured; email was not sent",
    );
    return { delivered: false };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      logger.error(
        { status: response.status, detail },
        "Email provider rejected the message",
      );
      return { delivered: false };
    }

    return { delivered: true };
  } catch (error) {
    logger.error({ err: error }, "Could not reach the email provider");
    return { delivered: false };
  }
}

export function buildPasswordResetEmail(
  resetUrl: string,
  name: string,
): Pick<MailMessage, "subject" | "html" | "text"> {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your Meraki password",
    text: [
      `Hi ${name},`,
      "",
      "Use the link below to choose a new password. It expires in 1 hour.",
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: [
      `<p>Hi ${safeName},</p>`,
      "<p>Use the link below to choose a new password. It expires in 1 hour.</p>",
      `<p><a href="${safeUrl}">Reset password</a></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join(""),
  };
}

interface BookingEmailDetails {
  customerName: string;
  workerName: string;
  serviceName: string;
  scheduledDate: Date;
  address: string;
  totalPrice: number;
  bookingId: number;
  appUrl: string;
}

/** Addis Ababa is UTC+3 year-round; formatting server-side must not depend on
 * the host's timezone. */
export function formatBookingTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

export function buildBookingConfirmationEmail(
  details: BookingEmailDetails,
): Pick<MailMessage, "subject" | "html" | "text"> {
  const when = formatBookingTime(details.scheduledDate);
  const link = details.appUrl
    ? `${details.appUrl}/bookings/${details.bookingId}`
    : "";
  const rows = [
    `Service: ${details.serviceName}`,
    `Helper: ${details.workerName}`,
    `When: ${when}`,
    `Address: ${details.address}`,
    `Total: ETB ${details.totalPrice.toLocaleString("en-US")} (pay after the job)`,
  ];

  return {
    subject: `Booking confirmed — ${details.serviceName}`,
    text: [
      `Hi ${details.customerName},`,
      "",
      "Your booking is confirmed:",
      ...rows,
      "",
      "You can view or cancel it from your Meraki dashboard.",
      link,
    ].join("\n"),
    html: [
      `<p>Hi ${escapeHtml(details.customerName)},</p>`,
      "<p>Your booking is confirmed:</p>",
      "<ul>",
      ...rows.map((row) => `<li>${escapeHtml(row)}</li>`),
      "</ul>",
      link
        ? `<p><a href="${escapeHtml(link)}">View booking</a></p>`
        : "",
      "<p>You can view or cancel it from your Meraki dashboard.</p>",
    ].join(""),
  };
}

/**
 * Sent immediately after checkout, while the booking is still `pending`.
 * Deliberately does not say "confirmed" — an admin confirms the helper later.
 */
export function buildBookingReceivedEmail(
  details: BookingEmailDetails,
): Pick<MailMessage, "subject" | "html" | "text"> {
  const when = formatBookingTime(details.scheduledDate);
  const rows = [
    `Service: ${details.serviceName}`,
    `Helper: ${details.workerName}`,
    `When: ${when}`,
    `Address: ${details.address}`,
    `Total: ETB ${details.totalPrice.toLocaleString("en-US")} (pay after the job)`,
  ];

  return {
    subject: `Booking received — ${details.serviceName}`,
    text: [
      `Hi ${details.customerName},`,
      "",
      "We have received your booking request:",
      ...rows,
      "",
      "We will confirm the helper shortly. You can view or cancel it from your Meraki dashboard.",
    ].join("\n"),
    html: [
      `<p>Hi ${escapeHtml(details.customerName)},</p>`,
      "<p>We have received your booking request:</p>",
      "<ul>",
      ...rows.map((row) => `<li>${escapeHtml(row)}</li>`),
      "</ul>",
      "<p>We will confirm the helper shortly. You can view or cancel it from your Meraki dashboard.</p>",
    ].join(""),
  };
}

export function buildBookingCancelledEmail(
  details: BookingEmailDetails,
): Pick<MailMessage, "subject" | "html" | "text"> {
  const when = formatBookingTime(details.scheduledDate);

  return {
    subject: `Booking cancelled — ${details.serviceName}`,
    text: [
      `Hi ${details.customerName},`,
      "",
      `Your ${details.serviceName} booking on ${when} has been cancelled.`,
      "",
      "If this was a mistake, you can book again at any time.",
    ].join("\n"),
    html: [
      `<p>Hi ${escapeHtml(details.customerName)},</p>`,
      `<p>Your ${escapeHtml(details.serviceName)} booking on ${escapeHtml(when)} has been cancelled.</p>`,
      "<p>If this was a mistake, you can book again at any time.</p>",
    ].join(""),
  };
}

export function buildOperatorBookingEmail(
  details: BookingEmailDetails & { customerPhone: string | null },
): Pick<MailMessage, "subject" | "html" | "text"> {
  const when = formatBookingTime(details.scheduledDate);
  const lines = [
    `Customer: ${details.customerName}${details.customerPhone ? ` (${details.customerPhone})` : ""}`,
    `Service: ${details.serviceName}`,
    `Helper: ${details.workerName}`,
    `When: ${when}`,
    `Address: ${details.address}`,
    `Total: ETB ${details.totalPrice.toLocaleString("en-US")}`,
  ];

  return {
    subject: `New booking #${details.bookingId} — ${details.serviceName}`,
    text: ["A new booking was created:", "", ...lines].join("\n"),
    html: [
      `<p>A new booking was created:</p>`,
      "<ul>",
      ...lines.map((line) => `<li>${escapeHtml(line)}</li>`),
      "</ul>",
    ].join(""),
  };
}

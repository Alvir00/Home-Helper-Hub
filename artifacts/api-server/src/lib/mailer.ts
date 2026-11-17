import { logger } from "./logger";

interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function fromAddress(): string {
  return process.env["MAIL_FROM"] ?? "Meraki <onboarding@resend.dev>";
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
      { to: message.to, subject: message.subject },
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

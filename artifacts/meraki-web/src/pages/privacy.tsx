import { LegalLayout } from "@/components/legal-layout";

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy policy"
      updated="24 November 2026"
      intro="We collect only what is needed to arrange a safe cleaning visit and run your account. This page explains what we hold, why, and how to get it removed."
    >
      <section>
        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address, phone number, password (stored
            only as a bcrypt hash) and, optionally, your neighborhood and address.
          </li>
          <li>
            <strong>Booking details:</strong> the service, helper, date, address and any notes you add.
          </li>
          <li>
            <strong>Helper application details:</strong> name, phone, optional email, neighborhood,
            experience and the services you offer.
          </li>
          <li>
            <strong>Technical data:</strong> IP address and request logs, kept for security and
            troubleshooting. Logs never contain passwords or session tokens.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Why we use it</h2>
        <ul>
          <li>To create and secure your account, including password resets.</li>
          <li>To send the assigned helper the address and time of a confirmed booking.</li>
          <li>To send you booking confirmations, cancellations and service updates.</li>
          <li>To prevent fraud, abuse and duplicate bookings, and to meet legal obligations.</li>
        </ul>
        <p>We do not sell personal data and we do not run advertising trackers.</p>
      </section>

      <section>
        <h2>3. Who can see your information</h2>
        <ul>
          <li>
            <strong>Your assigned helper</strong> sees your first name, the booking address and a
            contact phone number once the booking is confirmed.
          </li>
          <li>
            <strong>Meraki administrators</strong> can see accounts and bookings to resolve support
            issues and investigate misuse.
          </li>
          <li>
            <strong>Service providers</strong> that host our database and deliver email process data on
            our instructions under contract.
          </li>
          <li>Authorities, only where required by Ethiopian law or to prevent serious harm.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cookies</h2>
        <p>
          Meraki sets one essential cookie to keep you signed in. It is HTTP-only, expires after seven
          days and is never used for advertising. Clearing cookies signs you out.
        </p>
      </section>

      <section>
        <h2>5. How long we keep data</h2>
        <ul>
          <li>Account and booking records: while your account is active, then up to 24 months for accounting and dispute resolution.</li>
          <li>Expired sessions: deleted automatically within one hour.</li>
          <li>Password reset links: deleted when used, or after one hour.</li>
          <li>Server logs: 30 days.</li>
        </ul>
      </section>

      <section>
        <h2>6. Security</h2>
        <p>
          Passwords are hashed with bcrypt, sessions are stored server-side and can be revoked
          instantly, and all traffic is encrypted in transit. No system is perfectly secure, so please
          use a unique password and tell us immediately if you suspect unauthorised access.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          You can ask us for a copy of your data, correct it, or delete your account and associated
          personal data. Email{" "}
          <a href="mailto:help@meraki.et" className="font-medium text-primary underline">
            help@meraki.et
          </a>{" "}
          from the address on your account and we will respond within 30 days. Some records may be
          retained where the law requires it.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>Meraki is for adults. We do not knowingly collect data from anyone under 18.</p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          If this policy changes materially we will post the new version here and email registered
          users. The date at the top always shows the current version.
        </p>
      </section>
    </LegalLayout>
  );
}

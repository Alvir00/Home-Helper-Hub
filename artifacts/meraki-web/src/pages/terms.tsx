import { LegalLayout } from "@/components/legal-layout";

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of service"
      updated="24 November 2026"
      intro="These terms explain how Meraki works for households and helpers in Addis Ababa. By creating an account or booking a service you agree to them."
    >
      <section>
        <h2>1. What Meraki is</h2>
        <p>
          Meraki is a booking platform that connects households with independent home-cleaning and
          laundry helpers. We verify helper identities and manage bookings, but the cleaning work is
          carried out by the helper you choose. Meraki is not the employer of any helper.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You must be at least 18 years old to book or offer services.</li>
          <li>Provide accurate contact details and the correct address for each booking.</li>
          <li>Keep your password private. You are responsible for activity under your account.</li>
          <li>One account per person. Do not share accounts or impersonate someone else.</li>
        </ul>
      </section>

      <section>
        <h2>3. Bookings and prices</h2>
        <ul>
          <li>Prices are shown in Ethiopian birr (ETB) before you confirm a booking.</li>
          <li>
            The total is calculated from the service's hourly rate and duration. Any subscription
            discount is applied at checkout.
          </li>
          <li>
            Payment is made directly to the helper after the job, in cash or by Telebirr, unless a
            different method is agreed in writing.
          </li>
          <li>
            A booking is confirmed once it appears in your dashboard. We may decline a booking if the
            address is outside our service area or the request is unsafe.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Cancellations and changes</h2>
        <ul>
          <li>You may cancel free of charge up to 24 hours before the scheduled start time.</li>
          <li>
            Cancelling within 24 hours, or not being home when the helper arrives, may result in a
            call-out fee of up to one hour of the booked service.
          </li>
          <li>If a helper cannot attend, we will offer a replacement or a full refund of any prepayment.</li>
        </ul>
      </section>

      <section>
        <h2>5. Household responsibilities</h2>
        <ul>
          <li>Provide safe access to the property, running water and the cleaning supplies listed in the service description.</li>
          <li>Secure cash, jewellery and sensitive documents before the visit.</li>
          <li>Treat helpers with respect. Harassment, discrimination or unsafe conditions are grounds for immediate account closure.</li>
        </ul>
      </section>

      <section>
        <h2>6. Helper responsibilities</h2>
        <ul>
          <li>Arrive on time, bring the agreed supplies and perform the service with reasonable care.</li>
          <li>Never share a customer's address, phone number or personal details with anyone else.</li>
          <li>Report accidents or damage immediately so we can resolve the issue fairly.</li>
        </ul>
      </section>

      <section>
        <h2>7. Damage and liability</h2>
        <p>
          Helpers are expected to work carefully. If something is damaged, report it within 24 hours
          with photos and we will investigate and arrange compensation where the helper was at fault.
          To the extent permitted by Ethiopian law, Meraki's liability for any claim is limited to the
          value of the booking concerned.
        </p>
      </section>

      <section>
        <h2>8. Reviews</h2>
        <p>
          Reviews may only be left for completed bookings. Keep them honest and civil: no personal
          data, threats or discriminatory language. We may remove reviews that break these rules.
        </p>
      </section>

      <section>
        <h2>9. Suspension and closure</h2>
        <p>
          We may suspend or close an account that repeatedly cancels, behaves abusively, commits fraud
          or puts helpers or customers at risk. You may close your account at any time by emailing
          help@meraki.et.
        </p>
      </section>

      <section>
        <h2>10. Changes to these terms</h2>
        <p>
          We may update these terms as the service grows. Material changes will be announced on this
          page at least 14 days before they take effect. Continuing to use Meraki after that date means
          you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>11. Governing law</h2>
        <p>
          These terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Disputes
          will first be handled in good faith through our support team.
        </p>
      </section>
    </LegalLayout>
  );
}

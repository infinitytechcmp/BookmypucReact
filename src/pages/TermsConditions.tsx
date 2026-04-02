import { PublicLayout } from '@/components/layouts/PublicLayout';

export default function TermsConditions() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold">Terms & Conditions</h1>
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <p className="text-muted-foreground">Last updated: March 31, 2026</p>

            <h2 className="mt-8 text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BookMyPUC, you accept and agree to be bound by these Terms and
              Conditions. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">2. Service Description</h2>
            <p>
              BookMyPUC is a platform that connects vehicle owners with certified PUC centers for
              booking pollution control certificate appointments. We facilitate the booking process
              but do not directly provide PUC testing services.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6">
              <li>Provide accurate and complete information during registration and booking</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Arrive at the PUC center on time for your scheduled appointment</li>
              <li>Bring all required documents for the PUC test</li>
              <li>Pay the applicable fees for the PUC test</li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">4. Booking and Cancellation</h2>
            <p>
              Bookings are confirmed upon successful completion of the booking process. You may cancel
              your booking through your dashboard. Cancellation policies may vary by center. Booking
              fees are non-refundable once confirmed.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">5. Payment Terms</h2>
            <p>
              Payment for PUC services is made directly to the PUC center. Prices displayed on our
              platform are indicative and may vary. The final price will be confirmed by the center.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">6. Limitation of Liability</h2>
            <p>
              BookMyPUC is not responsible for the quality of services provided by PUC centers, test
              results, or any disputes between users and centers. We act solely as a booking platform.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">7. Intellectual Property</h2>
            <p>
              All content on BookMyPUC, including text, graphics, logos, and software, is the property
              of BookMyPUC and protected by copyright laws. You may not reproduce or distribute any
              content without our permission.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">8. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violation of
              these terms or for any other reason at our discretion.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">9. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of our services after changes
              constitutes acceptance of the modified terms.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">10. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of courts in Mumbai, India.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">11. Contact Information</h2>
            <p>
              For questions about these terms, contact us at:
              <br />
              Email: legal@bookmypuc.com
              <br />
              Phone: +91 9876543210
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import { PublicLayout } from '@/components/layouts/PublicLayout';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <GradientHeading level={1} className="mb-8 text-4xl font-bold">Privacy Policy</GradientHeading>
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <p className="text-muted-foreground">Last updated: March 31, 2026</p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">1. Information We Collect</GradientHeading>
            <p>
              We collect information that you provide directly to us when you register for an account,
              book a PUC appointment, or communicate with us. This includes your name, email address,
              phone number, vehicle details, and payment information.
            </p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">2. How We Use Your Information</GradientHeading>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6">
              <li>Process your PUC certificate bookings</li>
              <li>Send you booking confirmations and reminders</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about updates and promotions</li>
              <li>Comply with legal obligations</li>
            </ul>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">3. Information Sharing</GradientHeading>
            <p>
              We share your information with PUC centers only to the extent necessary to fulfill your
              booking. We do not sell your personal information to third parties. We may share
              information with service providers who assist us in operating our platform.
            </p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">4. Data Security</GradientHeading>
            <p>
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">5. Your Rights</GradientHeading>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">6. Cookies</GradientHeading>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and
              assist in our marketing efforts. You can control cookies through your browser settings.
            </p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">7. Changes to This Policy</GradientHeading>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <GradientHeading level={2} className="mt-8 text-2xl font-semibold">8. Contact Us</GradientHeading>
            <p>
              If you have any questions about this privacy policy, please contact us at:
              <br />
              Email: privacy@bookmypuc.com
              <br />
              Phone: +91 8308544837
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

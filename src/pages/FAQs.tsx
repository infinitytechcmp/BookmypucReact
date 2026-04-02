import { PublicLayout } from '@/components/layouts/PublicLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export default function FAQs() {
  const faqs = [
    {
      question: 'What is a PUC certificate?',
      answer: 'A Pollution Under Control (PUC) certificate is a mandatory document that certifies your vehicle meets the required emission standards set by the government. It helps reduce air pollution and is required for vehicle registration renewal.'
    },
    {
      question: 'How often do I need to renew my PUC certificate?',
      answer: 'PUC certificates are typically valid for 6 months for petrol vehicles and 3 months for diesel vehicles. You need to renew it before the expiry date to avoid penalties.'
    },
    {
      question: 'How do I book an appointment on BookMyPUC?',
      answer: 'Simply visit our Find Centers page, select your location and vehicle type, choose a convenient center, and complete the 3-step booking process. You will receive instant confirmation via email and WhatsApp.'
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel your booking from your dashboard. However, rescheduling needs to be done by canceling the existing booking and creating a new one.'
    },
    {
      question: 'What documents do I need to bring to the PUC center?',
      answer: 'You need to bring your vehicle registration certificate (RC), the booking confirmation, and your vehicle for the emission test.'
    },
    {
      question: 'How long does the PUC test take?',
      answer: 'The PUC test typically takes 10-15 minutes. You will receive your certificate immediately after passing the test.'
    },
    {
      question: 'What if my vehicle fails the PUC test?',
      answer: 'If your vehicle fails the test, the center will provide you with details about the issues. You will need to get your vehicle serviced and return for a retest.'
    },
    {
      question: 'Is the booking fee refundable?',
      answer: 'Booking fees are non-refundable once the appointment is confirmed. However, you can cancel before the scheduled date without any penalty.'
    },
    {
      question: 'Are all centers on BookMyPUC certified?',
      answer: 'Yes, all centers listed on our platform are verified and certified by the relevant authorities to conduct pollution tests.'
    },
    {
      question: 'How will I receive my PUC certificate?',
      answer: 'You will receive a physical certificate at the center after passing the test. A digital copy will also be uploaded to your dashboard for easy access.'
    }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about PUC certificates and our booking platform
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border bg-card px-6">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 rounded-lg bg-muted/50 p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">Still have questions?</h2>
            <p className="mb-4 text-muted-foreground">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <a
              href="/contact"
              className="text-primary hover:underline"
            >
              Contact Us →
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

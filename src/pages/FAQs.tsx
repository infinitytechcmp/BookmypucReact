import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { cmsService } from '@/services/cmsService';
import { Skeleton } from '@/components/ui/skeleton';
import { GradientHeading } from '@/components/ui/gradient-heading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export default function FAQs() {
  const [faqs, setFaqs] = useState<{question: string; answer: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    cmsService.getFaqs().then((res) => {
      if (mounted) {
        if (!res.error && Array.isArray(res.data)) {
          setFaqs(res.data);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <GradientHeading level={1} className="mb-4 text-4xl font-bold md:text-5xl">Frequently Asked Questions</GradientHeading>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about PUC certificates and our booking platform
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border bg-card px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No FAQs available at the moment.
              </div>
            )}
          </Accordion>

          <div className="mt-12 rounded-lg bg-muted/50 p-8 text-center">
            <GradientHeading level={2} className="mb-2 text-xl font-semibold">Still have questions?</GradientHeading>
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

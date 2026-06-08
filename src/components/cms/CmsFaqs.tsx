import { useEffect, useState } from 'react';
import { cmsService } from '@/services/cmsService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsFaqsProps {
  title?: string;
  description?: string;
  faq_category_ids?: string;
  limit?: string;
  enable_lazy_loading?: string;
}

export function CmsFaqs({
  title = "Frequently Asked Questions",
  description,
  faq_category_ids,
  limit,
}: CmsFaqsProps) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFaqs = async () => {
      try {
        const response = await cmsService.getFaqs();
        if (mounted && response && !response.error) {
          let fetchedFaqs = response.data || [];

          // Filter by category if category IDs are provided
          if (faq_category_ids) {
            const categories = faq_category_ids.split(',').map((id) => parseInt(id.trim(), 10));
            if (categories.length > 0) {
              fetchedFaqs = fetchedFaqs.filter((faq: any) => categories.includes(faq.category_id));
            }
          }

          // Limit the number of FAQs
          if (limit) {
            const limitNum = parseInt(limit, 10);
            if (!Number.isNaN(limitNum) && limitNum > 0) {
              fetchedFaqs = fetchedFaqs.slice(0, limitNum);
            }
          }

          setFaqs(fetchedFaqs);
        }
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFaqs();

    return () => {
      mounted = false;
    };
  }, [faq_category_ids, limit]);

  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center space-y-4">
        <div className="h-8 w-1/3 bg-slate-200 animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded" />
        <div className="w-full max-w-3xl space-y-2 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <GradientHeading level={2} className="mb-4 text-4xl font-bold md:text-5xl">{title}</GradientHeading>
          {description && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        <Accordion type="single" collapsible className="space-y-4 w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`} className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { CheckCircle2, ArrowRight, Zap, Shield, Star, Sparkles } from 'lucide-react';
import { parseShortcodes, ShortcodeNode } from '@/utils/shortcodeParser';
import { CmsContentFeatureList } from '@/components/cms/CmsContentFeatureList';
import { CmsRenderer } from '@/components/cms/CmsRenderer';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function Home() {
  const [pageContent, setPageContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Page Content
  useEffect(() => {
    cmsService.getPageBySlug('home')
      .then(data => {
        if (data && !data.error && data.data) {
          setPageContent(data.data.content);
        }
      })
      .catch(err => console.error('Failed to fetch home page content:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* Dynamic CMS Content (Simple Slider, Feature Lists, Blog Posts, etc.) */}
      <div className="cms-content-wrapper min-h-[50vh]">
        {!isLoading && <CmsRenderer content={pageContent} />}
      </div>

      {/* CTA Section (Hardcoded) */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-2/10 to-chart-3/10" />

        <div className="container relative z-10 mx-auto px-4">
          <Card className="group relative overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-xl">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 opacity-50" />

            <CardContent className="relative p-12 text-center md:p-16">
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex justify-center">
                  <div className="animate-glow-pulse inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2">
                    <Zap className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>

                <GradientHeading level={2} className="mb-6 text-4xl font-bold md:text-5xl">
                  Ready to Get Your PUC Certificate?
                </GradientHeading>
                <p className="mb-8 text-lg text-muted-foreground">
                  Join thousands of satisfied customers who trust BookMyPUC for their pollution certificate needs
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" className="group h-14 px-8 text-lg shadow-2xl transition-all hover:shadow-primary/50" asChild>
                    <Link to="/find-centers">
                      <span className="flex items-center gap-2">
                        Get Started Now
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 border-2 px-8 text-lg hover:border-primary hover:bg-primary/5" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span>Verified Centers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DEBUG OUTPUT */}
      {/* <div className="container mx-auto px-4 py-8 bg-black text-green-500 font-mono text-xs">
        Debug Nodes: {JSON.stringify(remainingNodes.map(n => ({ type: n.type, name: n.name })))}
      </div> */}

    </PublicLayout>
  );
}

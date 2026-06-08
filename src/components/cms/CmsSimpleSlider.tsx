import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsService } from '@/services/cmsService';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsSimpleSliderProps {
  style?: string;
  key?: string; // Note: 'key' is a reserved prop in React, but from the parser it might come as 'sliderKey' or 'key_prop'
  [key: string]: any;
}

export function CmsSimpleSlider({ style, key: sliderKeyProp, sliderKey, ...props }: CmsSimpleSliderProps) {
  const [sliders, setSliders] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // The shortcode parser might pass 'key' as a prop, but React consumes 'key'.
  // We'll check 'sliderKey' or props['key'] if it somehow bypasses React's reserved prop filter.
  const targetKey = sliderKey || sliderKeyProp || props['key'] || 'home-slider';

  useEffect(() => {
    let mounted = true;
    cmsService.getSimpleSliders()
      .then(data => {
        if (!mounted) return;
        if (data && !data.error && data.data) {
          const sliderGroups = Array.isArray(data.data) ? data.data : (data.data.data || []);
          const targetSliderGroup = sliderGroups.find((s: any) => s.key === targetKey) || sliderGroups[0];

          if (targetSliderGroup && Array.isArray(targetSliderGroup.items) && targetSliderGroup.items.length > 0) {
            const formattedSliders = targetSliderGroup.items.map((item: any) => ({
              title: item.title || '',
              subtitle: item.subtitle || '',
              description: item.description || '',
              link: item.link || '/find-centers',
              image: cmsService.getImageUrl(item.image) || null,
              button_label: item.button_label || 'Book PUC Now'
            }));
            setSliders(formattedSliders);
          }
        }
      })
      .catch(err => console.error('Failed to fetch simple sliders:', err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [targetKey]);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center bg-muted/20 animate-pulse">
        <span className="text-muted-foreground">Loading slider...</span>
      </div>
    );
  }

  if (sliders.length === 0) {
    return null; // Return nothing if no sliders found
  }

  // Right now we only have style-1 (the Hero style), but we can add more styles later based on the 'style' prop
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-chart-2/5 transition-all duration-700" style={{
      backgroundImage: sliders[currentSlide]?.image ? `url(${sliders[currentSlide].image})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Dark overlay if image exists to make text readable */}
      {sliders[currentSlide]?.image && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      )}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 animate-pulse rounded-full bg-chart-2/10 blur-3xl animation-delay-2000" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 animate-pulse rounded-full bg-chart-3/10 blur-3xl animation-delay-4000" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute h-2 w-2 animate-float rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 flex animate-bounce-in justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              India's #1 PUC Booking Platform
            </div>
          </div>

          {/* Main Heading */}
          <GradientHeading level={1} key={`title-${currentSlide}`} className="mb-6 animate-slide-up text-5xl font-bold tracking-tight md:text-7xl drop-shadow-sm gradient-text">
            {sliders[currentSlide]?.title}
            {sliders[currentSlide]?.subtitle && (
              <span className="mt-2 block gradient-text">{sliders[currentSlide]?.subtitle}</span>
            )}
          </GradientHeading>

          {/* Subheading */}
          <p key={`desc-${currentSlide}`} className="animate-fade-in animation-delay-300 mb-10 text-lg text-muted-foreground md:text-xl drop-shadow-sm">
            {sliders[currentSlide]?.description}
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up animation-delay-500 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group relative h-14 overflow-hidden px-8 text-lg shadow-2xl transition-all hover:shadow-primary/50" asChild>
              <Link to={sliders[currentSlide]?.link || '/find-centers'}>
                <span className="relative z-10 flex items-center gap-2">
                  {sliders[currentSlide]?.button_label || 'Book PUC Now'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 border-2 px-8 text-lg hover:border-primary hover:bg-primary/5" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>

          {/* Slider Dots */}
          {sliders.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {sliders.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary' : 'bg-primary/20 hover:bg-primary/50'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}

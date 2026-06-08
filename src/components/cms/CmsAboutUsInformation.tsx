import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, Search, FileCheck, CheckCircle2, Shield, Clock } from 'lucide-react';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsAboutUsInformationProps {
  style?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  quantity?: string;
  [key: string]: string | undefined;
}

export function CmsAboutUsInformation({
  style,
  title,
  subtitle,
  description,
  quantity,
  ...props
}: CmsAboutUsInformationProps) {
  const itemQuantity = parseInt(quantity || '0', 10);
  const items = [];
  for (let i = 1; i <= itemQuantity; i++) {
    items.push({
      title: props[`title_${i}`],
      description: props[`description_${i}`],
      icon: props[`icon_${i}`],
    });
  }

  const renderIcon = (iconClass?: string) => {
    if (!iconClass) return <CheckCircle2 className="h-8 w-8" />;
    if (iconClass.includes('search')) return <Search className="h-8 w-8" />;
    if (iconClass.includes('mail-fast')) return <FileCheck className="h-8 w-8" />;
    if (iconClass.includes('building-bank')) return <Shield className="h-8 w-8" />;
    return <CheckCircle2 className="h-8 w-8" />;
  };

  const renderIconSmall = (iconClass?: string) => {
    if (!iconClass) return <CheckCircle2 className="h-10 w-10" />;
    if (iconClass.includes('search')) return <Search className="h-10 w-10" />;
    if (iconClass.includes('mail-fast')) return <Clock className="h-10 w-10" />;
    if (iconClass.includes('building-bank')) return <Shield className="h-10 w-10" />;
    return <CheckCircle2 className="h-10 w-10" />;
  };

  // STYLE 6: "Why Choose Us" Glassmorphism Cards
  if (style === 'style-6') {
    return (
      <section className="py-20 md:py-32 w-full">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <GradientHeading level={2} className="mb-4 text-4xl font-bold md:text-5xl">
              {title || ''}
            </GradientHeading>
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {items.map((feature, index) => {
              const colorClasses = ['text-primary', 'text-chart-2', 'text-chart-3'];
              const bgClasses = ['from-primary/10 to-chart-2/10', 'from-chart-2/10 to-chart-3/10', 'from-chart-3/10 to-primary/10'];
              const cClass = colorClasses[index % colorClasses.length];
              const bgClass = bgClasses[index % bgClasses.length];

              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-2/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <CardContent className="relative p-8">
                    <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${bgClass} ${cClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      {renderIcon(feature.icon)}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>

                  <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-chart-2 to-chart-3 opacity-20 blur-xl" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // STYLE 12: "How It Works" Timeline
  if (style === 'style-12') {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/30 to-background py-20 md:py-32 w-full">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <GradientHeading level={2} className="mb-4 text-4xl font-bold md:text-5xl">
              {title || ''}
            </GradientHeading>
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="relative mx-auto max-w-5xl">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary via-chart-2 to-chart-3 md:block" />

            <div className="space-y-12">
              {items.map((item, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className={`relative flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <Card className="group overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                        <CardContent className="p-8">
                          <div className={`mb-4 flex items-center gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                              {index + 1}
                            </div>
                            <h3 className="text-2xl font-bold">{item.title}</h3>
                          </div>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="relative z-10 hidden md:block">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-xl">
                        {renderIconSmall(item.icon)}
                      </div>
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // DEFAULT / STYLE 7: "About Us" Layout
  const formattedDescription = description
    ? description.split('{{NEWLINE}}').map((str, idx) => (
        <span key={idx}>
          {str}
          <br />
        </span>
      ))
    : null;

  const stats = [
    { label: 'Centers Listed', value: '500+', icon: Award },
    { label: 'Bookings Completed', value: '10,000+', icon: Target },
    { label: 'Happy Customers', value: '8,000+', icon: Users }
  ];

  return (
    <>
      <div className="mb-12 text-center mt-12 w-full">
        <GradientHeading level={1} className="mb-4 text-4xl font-bold md:text-5xl">{title || 'About Us'}</GradientHeading>
        {subtitle && (
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {description && (
        <Card className="mb-12 w-full">
          <CardContent className="p-8 md:p-12">
            <GradientHeading level={2} className="mb-4 text-2xl font-bold md:text-3xl">Our Mission</GradientHeading>
            <p className="text-lg text-muted-foreground">{formattedDescription}</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-12 w-full">
        <GradientHeading level={2} className="mb-8 text-center text-2xl font-bold md:text-3xl">Our Impact</GradientHeading>
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="mb-2 text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {items.length > 0 && (
        <Card className="w-full">
          <CardContent className="p-8 md:p-12">
            <GradientHeading level={2} className="mb-6 text-2xl font-bold md:text-3xl">Our Values</GradientHeading>
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((item, index) => (
                <div key={index}>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

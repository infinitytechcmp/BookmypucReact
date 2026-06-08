import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bike, Car, Truck, CarTaxiFront, Users, Award, Shield, CheckCircle } from 'lucide-react';

interface CmsContentFeatureListProps {
  quantity?: string;
  [key: string]: string | undefined; // Handles title_1, icon_1, description_1 etc.
}

export function CmsContentFeatureList(props: CmsContentFeatureListProps) {
  const quantity = parseInt(props.quantity || '0', 10);
  const items = [];

  for (let i = 1; i <= quantity; i++) {
    items.push({
      title: props[`title_${i}`],
      description: props[`description_${i}`],
      icon: props[`icon_${i}`],
    });
  }

  // Determine which layout to render based on the presence of descriptions
  const hasDescriptions = items.some(item => item.description);

  // Helper to map TI icons to Lucide React icons
  const renderIcon = (iconClass?: string) => {
    if (!iconClass) return <CheckCircle className="h-8 w-8 text-primary" />;
    
    // Quick select vehicle icons
    if (iconClass.includes('bike')) return <Bike className="h-8 w-8 text-primary" />;
    if (iconClass.includes('car')) return <Car className="h-8 w-8 text-primary" />;
    if (iconClass.includes('truck-delivery')) return <Truck className="h-8 w-8 text-primary" />;
    if (iconClass.includes('truck')) return <CarTaxiFront className="h-8 w-8 text-primary" />;
    
    // Fallback or generic
    return <CheckCircle className="h-8 w-8 text-primary" />;
  };

  // If items have descriptions, render the "Stats" layout
  if (hasDescriptions) {
    return (
      <div className="animate-fade-in animation-delay-700 mt-16 mb-8 w-full">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          {items.map((stat, index) => (
            <div key={index} className="group p-6 rounded-2xl bg-card/20 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary transition-transform group-hover:scale-110 md:text-5xl drop-shadow-sm mb-2">
                {stat.description}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render the "Quick Vehicle Type Select" layout
  return (
    <div className="animate-fade-in animation-delay-600 mt-12 mb-8 w-full">
      <div className="text-center mx-auto max-w-4xl">
        <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground drop-shadow-sm">Quick Select Vehicle Type</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
        {items.map((item, index) => {
          let prefill = '2W';
          if (item.title?.includes('3')) prefill = '3W';
          if (item.title?.includes('4')) prefill = '4W';
          if (item.title?.toLowerCase()?.includes('commercial')) prefill = 'Commercial';

          return (
            <Button key={index} variant="outline" className="flex h-28 w-32 flex-col gap-3 rounded-2xl border-2 bg-card/80 backdrop-blur-sm hover:border-primary hover:bg-primary/5 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md" asChild>
              <Link to="/find-centers" state={{ prefilledVehicleType: prefill }}>
                <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                  {renderIcon(item.icon)}
                </div>
                <span className="font-semibold">{item.title}</span>
              </Link>
            </Button>
          );
        })}
      </div>
        </div>
      </div>
  );
}

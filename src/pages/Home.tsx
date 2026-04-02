import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { CheckCircle2, Search, FileCheck, ArrowRight, Zap, Shield, Clock, Star, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Search,
      title: 'Find Centers Easily',
      description: 'Search and discover certified PUC centers near you with advanced filters',
      color: 'text-primary'
    },
    {
      icon: FileCheck,
      title: 'Quick Booking',
      description: 'Book your PUC appointment in just 3 simple steps with instant confirmation',
      color: 'text-chart-2'
    },
    {
      icon: CheckCircle2,
      title: 'Certified Centers',
      description: 'All centers are verified and certified for pollution testing services',
      color: 'text-chart-3'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Find Center',
      description: 'Search for PUC centers in your area using our smart filters',
      icon: Search
    },
    {
      step: '2',
      title: 'Book Appointment',
      description: 'Select a convenient time slot and complete the booking process',
      icon: Clock
    },
    {
      step: '3',
      title: 'Get Certificate',
      description: 'Visit the center and receive your PUC certificate instantly',
      icon: Shield
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Certified Centers' },
    { value: '50+', label: 'Cities Covered' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];

  return (
    <PublicLayout>
      {/* Hero Section with Advanced Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
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
              key={i}
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

        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 flex animate-bounce-in justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                India's #1 PUC Booking Platform
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 animate-slide-up text-5xl font-bold tracking-tight md:text-7xl">
              Book Your PUC Certificate
              <span className="gradient-text-vibrant mt-2 block">Hassle-Free</span>
            </h1>

            {/* Subheading */}
            <p className="animate-fade-in animation-delay-300 mb-10 text-lg text-muted-foreground md:text-xl">
              India's most trusted platform for Pollution Under Control certificate bookings.
              Find certified centers, book appointments, and get your PUC certificate instantly.
            </p>

            {/* CTA Buttons */}
            <div className="animate-slide-up animation-delay-500 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="group relative h-14 overflow-hidden px-8 text-lg shadow-2xl transition-all hover:shadow-primary/50" asChild>
                <Link to="/find-centers">
                  <span className="relative z-10 flex items-center gap-2">
                    Book PUC Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 border-2 px-8 text-lg hover:border-primary hover:bg-primary/5" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="animate-fade-in animation-delay-700 mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-3xl font-bold text-primary transition-transform group-hover:scale-110 md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
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

      {/* Features Section with Glassmorphism */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Why Choose <span className="gradient-text">BookMyPUC</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience the future of PUC certificate bookings with our innovative platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-2/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <CardContent className="relative p-8">
                    <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-chart-2/10 ${feature.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-chart-2 to-chart-3 opacity-20 blur-xl" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/30 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Get your PUC certificate in three simple steps
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary via-chart-2 to-chart-3 md:block" />

            <div className="space-y-12">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className={`relative flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <Card className="group overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                        <CardContent className="p-8">
                          <div className={`mb-4 flex items-center gap-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                              {item.step}
                            </div>
                            <h3 className="text-2xl font-bold">{item.title}</h3>
                          </div>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Center Icon */}
                    <div className="relative z-10 hidden md:block">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-xl">
                        <Icon className="h-10 w-10" />
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden flex-1 md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                
                <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                  Ready to Get Your PUC Certificate?
                </h2>
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
    </PublicLayout>
  );
}

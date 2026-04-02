import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award } from 'lucide-react';

export default function AboutUs() {
  const stats = [
    { label: 'Centers Listed', value: '500+', icon: Award },
    { label: 'Bookings Completed', value: '10,000+', icon: Target },
    { label: 'Happy Customers', value: '8,000+', icon: Users }
  ];

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">About BookMyPUC</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Your trusted partner for hassle-free PUC certificate bookings across India
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="p-8 md:p-12">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Our Mission</h2>
            <p className="mb-4 text-lg text-muted-foreground">
              At BookMyPUC, we are committed to making pollution control certificate bookings simple, 
              fast, and accessible for every vehicle owner in India. We believe in contributing to a 
              cleaner environment by ensuring that every vehicle meets the required pollution standards.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform connects vehicle owners with certified PUC centers, enabling seamless 
              appointment scheduling and instant certificate generation. We work with verified centers 
              across the country to provide you with reliable and convenient service.
            </p>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Our Impact</h2>
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

        {/* Values Section */}
        <Card>
          <CardContent className="p-8 md:p-12">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Trust & Reliability</h3>
                <p className="text-muted-foreground">
                  We partner only with certified and verified PUC centers to ensure you receive 
                  authentic certificates and quality service.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Customer First</h3>
                <p className="text-muted-foreground">
                  Your convenience is our priority. We've designed our platform to make booking 
                  as simple and quick as possible.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Environmental Responsibility</h3>
                <p className="text-muted-foreground">
                  We're committed to promoting cleaner air by making pollution testing accessible 
                  and encouraging compliance.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously improve our platform with the latest technology to provide you 
                  with the best booking experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

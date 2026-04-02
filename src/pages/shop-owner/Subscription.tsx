import { ShopOwnerDashboardLayout } from '@/components/layouts/ShopOwnerDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export default function Subscription() {
  const { user } = useAuth();

  return (
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Subscription</h2>
          <p className="text-muted-foreground">Manage your subscription plan</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Standard Plan</span>
                <Badge variant={user?.subscription === 'active' ? 'default' : 'secondary'}>
                  {user?.subscription === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Unlimited center listings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Booking management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Analytics dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ShopOwnerDashboardLayout>
  );
}

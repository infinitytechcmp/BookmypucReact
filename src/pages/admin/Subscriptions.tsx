import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    // Get all shop owners as subscriptions
    const shopOwners = await adminService.getAllShopOwners();
    setSubscriptions(shopOwners);
  };

  const handleToggleSubscription = async (ownerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    if (newStatus === 'active') {
      const success = await adminService.resumeSubscription(ownerId);
      if (success) {
        toast.success('Subscription resumed successfully');
        await loadSubscriptions();
      }
    } else {
      const success = await adminService.pauseSubscription(ownerId);
      if (success) {
        toast.success('Subscription paused successfully');
        await loadSubscriptions();
      }
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Subscriptions</h2>
          <p className="text-muted-foreground">Manage shop owner subscriptions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.shopOwnerName}</TableCell>
                    <TableCell>{sub.email}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'default' : 'outline'}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSubscription(sub.id, sub.status)}
                      >
                        {sub.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

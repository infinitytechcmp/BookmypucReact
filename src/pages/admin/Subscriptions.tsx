import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Filter } from 'lucide-react';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    shopOwnerName: '',
    email: '',
    plan: '',
    status: 'all'
  });

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

  const filteredSubscriptions = subscriptions.filter((sub) => {
    return (
      (sub.shopOwnerName || '').toLowerCase().includes(filters.shopOwnerName.toLowerCase()) &&
      (sub.email || '').toLowerCase().includes(filters.email.toLowerCase()) &&
      (sub.plan || '').toLowerCase().includes(filters.plan.toLowerCase()) &&
      (filters.status === 'all' || sub.status === filters.status)
    );
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Subscriptions</h2>
            <p className="text-muted-foreground">Manage shop owner subscriptions</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Apply filters to subscriptions list.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-owner">Owner Name</Label>
                    <Input
                      id="filter-owner"
                      placeholder="Filter Name..."
                      value={filters.shopOwnerName}
                      onChange={(e) => setFilters(prev => ({ ...prev, shopOwnerName: e.target.value }))}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-email">Email</Label>
                    <Input
                      id="filter-email"
                      placeholder="Filter Email..."
                      value={filters.email}
                      onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-plan">Plan</Label>
                    <Input
                      id="filter-plan"
                      placeholder="Filter Plan..."
                      value={filters.plan}
                      onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger id="filter-status" className="col-span-2 h-8">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setFilters({ shopOwnerName: '', email: '', plan: '', status: 'all' })}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
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
                {filteredSubscriptions.map((sub) => (
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

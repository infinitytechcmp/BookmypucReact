import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { authService } from '@/services/authService';
import { Plus } from 'lucide-react';
import type { ShopOwner } from '@/types/types';

export default function AdminShopOwners() {
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    loadShopOwners();
  }, []);

  const loadShopOwners = async () => {
    const allShopOwners = await adminService.getAllShopOwners();
    setShopOwners(allShopOwners);
  };

  const handleToggleStatus = async (ownerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (newStatus === 'active') {
      const success = await adminService.activateShopOwner(ownerId);
      if (success) {
        toast.success('Shop owner activated successfully');
        await loadShopOwners();
      }
    } else {
      const success = await adminService.deactivateShopOwner(ownerId);
      if (success) {
        toast.success('Shop owner deactivated successfully');
        await loadShopOwners();
      }
    }
  };

  const handleToggleSubscription = async (ownerId: number, currentSubscription: string) => {
    const newSubscription = currentSubscription === 'active' ? 'paused' : 'active';
    if (newSubscription === 'active') {
      const success = await adminService.resumeSubscription(ownerId);
      if (success) {
        toast.success('Subscription resumed successfully');
        await loadShopOwners();
      }
    } else {
      const success = await adminService.pauseSubscription(ownerId);
      if (success) {
        toast.success('Subscription paused successfully');
        await loadShopOwners();
      }
    }
  };

  const handleOpenDialog = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate password (min 6 characters)
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'shopOwner'
      });

      if (success) {
        toast.success('Shop owner added successfully');
        await loadShopOwners();
        handleCloseDialog();
      } else {
        toast.error('Failed to add shop owner. Email may already exist.');
      }
    } catch (error) {
      toast.error('An error occurred while adding shop owner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Shop Owners</h2>
            <p className="text-muted-foreground">Manage shop owners and their subscriptions</p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shop Owner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Shop Owners ({shopOwners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>{owner.id}</TableCell>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>
                      <Badge variant={owner.status === 'active' ? 'default' : 'secondary'}>
                        {owner.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={owner.subscription === 'active' ? 'default' : 'outline'}>
                        {owner.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant={owner.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(owner.id, owner.status)}
                        >
                          {owner.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSubscription(owner.id, owner.subscription)}
                        >
                          {owner.subscription === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shop Owner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ABC PUC Services"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="business@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Shop Owner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

import { useEffect, useState } from 'react';
import { ShopOwnerDashboardLayout } from '@/components/layouts/ShopOwnerDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { centerService } from '@/services/centerService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Center } from '@/types/types';

interface CenterFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  taluka: string;
  pincode: string;
  workingHours: string;
  contact: string;
  pricing_2w_petrol: string;
  pricing_3w_petrol: string;
  pricing_3w_diesel: string;
  pricing_4w_petrol: string;
  pricing_4w_diesel: string;
}

export default function MyCenters() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    taluka: '',
    pincode: '',
    workingHours: '09:00 - 18:00',
    contact: '',
    pricing_2w_petrol: '50',
    pricing_3w_petrol: '100',
    pricing_3w_diesel: '150',
    pricing_4w_petrol: '125',
    pricing_4w_diesel: '150'
  });

  useEffect(() => {
    if (user) {
      loadCenters();
    }
  }, [user]);

  const loadCenters = async () => {
    if (user) {
      const ownerCenters = await centerService.getCentersByOwnerId(user.id);
      setCenters(ownerCenters);
    }
  };

  const handleOpenDialog = (center?: Center) => {
    if (center) {
      setEditingCenter(center);
      setFormData({
        name: center.name,
        address: center.address,
        city: center.city,
        state: center.state,
        taluka: center.taluka,
        pincode: center.pincode,
        workingHours: center.working_hours,
        contact: center.contact,
        pricing_2w_petrol: center.pricing['2W_Petrol']?.toString() || '50',
        pricing_3w_petrol: center.pricing['3W_Petrol']?.toString() || '100',
        pricing_3w_diesel: center.pricing['3W_Diesel']?.toString() || '150',
        pricing_4w_petrol: center.pricing['4W_Petrol']?.toString() || '125',
        pricing_4w_diesel: center.pricing['4W_Diesel']?.toString() || '150'
      });
    } else {
      setEditingCenter(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        taluka: '',
        pincode: '',
        workingHours: '09:00 - 18:00',
        contact: '',
        pricing_2w_petrol: '50',
        pricing_3w_petrol: '100',
        pricing_3w_diesel: '150',
        pricing_4w_petrol: '125',
        pricing_4w_diesel: '150'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCenter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.contact) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const centerData = {
        ownerId: user!.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        taluka: formData.taluka,
        pincode: formData.pincode,
        working_hours: formData.workingHours,
        contact: formData.contact,
        pricing: {
          '2W_Petrol': parseInt(formData.pricing_2w_petrol),
          '3W_Petrol': parseInt(formData.pricing_3w_petrol),
          '3W_Diesel': parseInt(formData.pricing_3w_diesel),
          '4W_Petrol': parseInt(formData.pricing_4w_petrol),
          '4W_Diesel': parseInt(formData.pricing_4w_diesel)
        },
        status: 'active' as const
      };

      if (editingCenter) {
        const success = await centerService.updateCenter(editingCenter.id, centerData);
        if (success) {
          toast.success('Center updated successfully');
          await loadCenters();
          handleCloseDialog();
        } else {
          toast.error('Failed to update center');
        }
      } else {
        const newCenter = await centerService.addCenter(centerData);
        if (newCenter) {
          toast.success('Center added successfully');
          await loadCenters();
          handleCloseDialog();
        } else {
          toast.error('Failed to add center');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this center?')) {
      const success = await centerService.deleteCenter(id);
      if (success) {
        toast.success('Center deleted successfully');
        await loadCenters();
      } else {
        toast.error('Failed to delete center');
      }
    }
  };

  return (
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Centers</h2>
            <p className="text-muted-foreground">Manage your PUC centers</p>
          </div>
          <Button type="button" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Center
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Centers ({centers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {centers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No centers found. Add your first center to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>{center.city}</TableCell>
                        <TableCell>{center.state}</TableCell>
                        <TableCell>{center.contact}</TableCell>
                        <TableCell>{center.working_hours}</TableCell>
                        <TableCell>
                          <Badge variant={center.status === 'active' ? 'default' : 'secondary'}>
                            {center.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(center)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(center.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCenter ? 'Edit Center' : 'Add New Center'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Center Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ABC PUC Center"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="taluka">Taluka</Label>
                  <Input
                    id="taluka"
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    placeholder="Thane"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="400001"
                  />
                </div>
                <div>
                  <Label htmlFor="workingHours">Working Hours</Label>
                  <Input
                    id="workingHours"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    placeholder="09:00 - 18:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pricing (₹)</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="pricing_2w_petrol" className="text-sm">2W Petrol</Label>
                    <Input
                      id="pricing_2w_petrol"
                      type="number"
                      value={formData.pricing_2w_petrol}
                      onChange={(e) => setFormData({ ...formData, pricing_2w_petrol: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_3w_petrol" className="text-sm">3W Petrol</Label>
                    <Input
                      id="pricing_3w_petrol"
                      type="number"
                      value={formData.pricing_3w_petrol}
                      onChange={(e) => setFormData({ ...formData, pricing_3w_petrol: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_3w_diesel" className="text-sm">3W Diesel</Label>
                    <Input
                      id="pricing_3w_diesel"
                      type="number"
                      value={formData.pricing_3w_diesel}
                      onChange={(e) => setFormData({ ...formData, pricing_3w_diesel: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_4w_petrol" className="text-sm">4W Petrol</Label>
                    <Input
                      id="pricing_4w_petrol"
                      type="number"
                      value={formData.pricing_4w_petrol}
                      onChange={(e) => setFormData({ ...formData, pricing_4w_petrol: e.target.value })}
                      placeholder="125"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_4w_diesel" className="text-sm">4W Diesel</Label>
                    <Input
                      id="pricing_4w_diesel"
                      type="number"
                      value={formData.pricing_4w_diesel}
                      onChange={(e) => setFormData({ ...formData, pricing_4w_diesel: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingCenter ? 'Update Center' : 'Add Center'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ShopOwnerDashboardLayout>
  );
}

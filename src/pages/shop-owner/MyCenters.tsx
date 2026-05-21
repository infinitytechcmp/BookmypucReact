import { useEffect, useState } from 'react';
import { ShopOwnerDashboardLayout } from '@/components/layouts/ShopOwnerDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { centerService } from '@/services/centerService';
import { apiRequest, API_ENDPOINTS } from '@/config/api';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import type { Center, ShopOwnerRegistration } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';

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
  pricing_commercial_petrol: string;
  pricing_commercial_diesel: string;
  center_code_petrol: string;
  center_code_diesel: string;
  license_document: string;
}

export default function MyCenters() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    state: '',
    status: 'all'
  });
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
    pricing_4w_diesel: '150',
    pricing_commercial_petrol: '200',
    pricing_commercial_diesel: '250',
    center_code_petrol: '',
    center_code_diesel: '',
    license_document: ''
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

  const handleOpenDialog = async (center?: Center) => {
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
        pricing_4w_diesel: center.pricing['4W_Diesel']?.toString() || '150',
        pricing_commercial_petrol: center.pricing['Commercial_Petrol']?.toString() || '200',
        pricing_commercial_diesel: center.pricing['Commercial_Diesel']?.toString() || '250',
        center_code_petrol: center.center_code_petrol || '',
        center_code_diesel: center.center_code_diesel || '',
        license_document: center.license_document || ''
      });
      setIsDialogOpen(true);
    } else {
      if (centers.length >= 1) {
        toast.error('You can only add one center per account.');
        return;
      }
      setEditingCenter(null);
      setIsSubmitting(true);
      
      let prefilled = {
        name: '',
        address: '',
        contact: '',
        center_code_petrol: '',
        center_code_diesel: '',
        license_document: ''
      };
      
      if (user?.email) {
        try {
          const res = await apiRequest<ShopOwnerRegistration>(
            `${API_ENDPOINTS.REGISTRATION_DETAILS}&email=${encodeURIComponent(user.email)}`
          );
          if (res.success && res.data) {
            const reg = res.data;
            prefilled = {
              name: reg.center_name || '',
              address: reg.address || '',
              contact: reg.contact || '',
              center_code_petrol: reg.center_code_petrol || '',
              center_code_diesel: reg.center_code_diesel || '',
              license_document: reg.center_license_document || ''
            };
          }
        } catch (err) {
          console.error('Failed to fetch registration details:', err);
        }
      }
      
      setIsSubmitting(false);
      setFormData({
        name: prefilled.name,
        address: prefilled.address,
        city: '',
        state: '',
        taluka: '',
        pincode: '',
        workingHours: '09:00 - 18:00',
        contact: prefilled.contact,
        pricing_2w_petrol: '50',
        pricing_3w_petrol: '100',
        pricing_3w_diesel: '150',
        pricing_4w_petrol: '125',
        pricing_4w_diesel: '150',
        pricing_commercial_petrol: '200',
        pricing_commercial_diesel: '250',
        center_code_petrol: prefilled.center_code_petrol,
        center_code_diesel: prefilled.center_code_diesel,
        license_document: prefilled.license_document
      });
      setIsDialogOpen(true);
    }
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
        owner_id: user!.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        taluka: formData.taluka,
        pincode: formData.pincode,
        working_hours: formData.workingHours,
        contact: formData.contact,
        center_code_petrol: formData.center_code_petrol,
        center_code_diesel: formData.center_code_diesel,
        license_document: formData.license_document,
        pricing: {
          '2W_Petrol': parseInt(formData.pricing_2w_petrol),
          '3W_Petrol': parseInt(formData.pricing_3w_petrol),
          '3W_Diesel': parseInt(formData.pricing_3w_diesel),
          '4W_Petrol': parseInt(formData.pricing_4w_petrol) || 125,
          '4W_Diesel': parseInt(formData.pricing_4w_diesel) || 150,
          'Commercial_Petrol': parseInt(formData.pricing_commercial_petrol) || 200,
          'Commercial_Diesel': parseInt(formData.pricing_commercial_diesel) || 250
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

  const filteredCenters = centers.filter((center) => {
    return (
      (center.name || '').toLowerCase().includes(filters.name.toLowerCase()) &&
      (center.city || '').toLowerCase().includes(filters.city.toLowerCase()) &&
      (center.state || '').toLowerCase().includes(filters.state.toLowerCase()) &&
      (filters.status === 'all' || center.status === filters.status)
    );
  });

  return (
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Centers</h2>
            <p className="text-muted-foreground">Manage your PUC centers</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredCenters} filename="my_centers" title="My PUC Centers" />
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
                      Apply filters to your centers.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-name">Name</Label>
                      <Input
                        id="filter-name"
                        placeholder="Filter Name..."
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-city">City</Label>
                      <Input
                        id="filter-city"
                        placeholder="Filter City..."
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-state">State</Label>
                      <Input
                        id="filter-state"
                        placeholder="Filter State..."
                        value={filters.state}
                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
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
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setFilters({ name: '', city: '', state: '', status: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {centers.length === 0 && (
              <Button type="button" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Center
              </Button>
            )}
          </div>
        </div>

        {centers.length >= 1 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
            <div className="flex gap-3">
              <div className="h-5 w-5 mt-0.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Single Center Limit</h4>
                <p className="mt-1 text-sm opacity-90">
                  You can only add one center per email/account. To update your center details, please click the edit icon in the actions column.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Centers ({filteredCenters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCenters.length === 0 ? (
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
                    {filteredCenters.map((center) => (
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
              <DialogDescription className="sr-only">
                Enter details for your pollution testing center, including name, contact, address, operating hours, and service pricing.
              </DialogDescription>
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
                    placeholder="8308544837"
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

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="center_code_petrol">Center Code Petrol</Label>
                  <Input
                    id="center_code_petrol"
                    value={formData.center_code_petrol}
                    onChange={(e) => setFormData({ ...formData, center_code_petrol: e.target.value })}
                    placeholder="Petrol Center Code"
                  />
                </div>
                <div>
                  <Label htmlFor="center_code_diesel">Center Code Diesel</Label>
                  <Input
                    id="center_code_diesel"
                    value={formData.center_code_diesel}
                    onChange={(e) => setFormData({ ...formData, center_code_diesel: e.target.value })}
                    placeholder="Diesel Center Code"
                  />
                </div>
                <div>
                  <Label htmlFor="license_document">License Document</Label>
                  <Input
                    id="license_document"
                    value={formData.license_document}
                    readOnly
                    className="bg-muted text-muted-foreground"
                    placeholder="No document uploaded"
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
                  <div>
                    <Label htmlFor="pricing_commercial_petrol" className="text-sm">Commercial Petrol</Label>
                    <Input
                      id="pricing_commercial_petrol"
                      type="number"
                      value={formData.pricing_commercial_petrol}
                      onChange={(e) => setFormData({ ...formData, pricing_commercial_petrol: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing_commercial_diesel" className="text-sm">Commercial Diesel</Label>
                    <Input
                      id="pricing_commercial_diesel"
                      type="number"
                      value={formData.pricing_commercial_diesel}
                      onChange={(e) => setFormData({ ...formData, pricing_commercial_diesel: e.target.value })}
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

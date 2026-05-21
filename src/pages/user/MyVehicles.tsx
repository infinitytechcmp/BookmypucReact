import { useEffect, useState } from 'react';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import type { Vehicle, VehicleType, FuelType } from '@/types/types';
import { useNavigate } from 'react-router-dom';
import { ExportButton } from '@/components/ExportButton';

export default function MyVehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [filters, setFilters] = useState({
    number: '',
    type: 'all',
    brand: '',
    fuel: 'all'
  });
  const [formData, setFormData] = useState({
    number: '',
    type: '2W' as VehicleType,
    brand: '',
    model: '',
    fuel: 'Petrol' as FuelType
  });

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    if (user) {
      const userVehicles = await vehicleService.getVehiclesByUserId(user.id);
      setVehicles(userVehicles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number || !formData.brand || !formData.model) {
      toast.error('Please fill all fields');
      return;
    }

    if (editingVehicle) {
      const success = await vehicleService.updateVehicle(editingVehicle.id, formData);
      if (success) {
        toast.success('Vehicle updated successfully');
        await loadVehicles();
        handleCloseDialog();
      }
    } else {
      if (user) {
        await vehicleService.addVehicle({
          userId: user.id,
          ...formData
        });
        toast.success('Vehicle added successfully');
        await loadVehicles();
        handleCloseDialog();
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      number: vehicle.number,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      fuel: vehicle.fuel
    });
    setIsDialogOpen(true);
  };

  const handleBookVehicle = (vehicle: Vehicle) => {
    navigate('/find-centers', { state: { prefilledVehicle: vehicle } });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      const success = await vehicleService.deleteVehicle(id);
      if (success) {
        toast.success('Vehicle deleted successfully');
        await loadVehicles();
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
    setFormData({
      number: '',
      type: '2W',
      brand: '',
      model: '',
      fuel: 'Petrol'
    });
  };

  const filteredVehicles = vehicles.filter(v => {
    return (
      (v.number || '').toLowerCase().includes(filters.number.toLowerCase()) &&
      (filters.type === 'all' || v.type === filters.type) &&
      (v.brand || '').toLowerCase().includes(filters.brand.toLowerCase()) &&
      (filters.fuel === 'all' || v.fuel === filters.fuel)
    );
  });

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Vehicles</h2>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredVehicles} filename="my_vehicles" title="My Vehicles List" />
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
                    <p className="text-sm text-muted-foreground">Apply filters to vehicles list.</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-number">Number</Label>
                      <Input
                        id="filter-number"
                        placeholder="Vehicle Number..."
                        value={filters.number}
                        onChange={(e) => setFilters(prev => ({ ...prev, number: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-type">Type</Label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="col-span-2 h-8">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="2W">2 Wheeler</SelectItem>
                          <SelectItem value="3W">3 Wheeler</SelectItem>
                          <SelectItem value="4W">4 Wheeler</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-brand">Brand</Label>
                      <Input
                        id="filter-brand"
                        placeholder="Brand..."
                        value={filters.brand}
                        onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-fuel">Fuel</Label>
                      <Select
                        value={filters.fuel}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, fuel: value }))}
                      >
                        <SelectTrigger className="col-span-2 h-8">
                          <SelectValue placeholder="Fuel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fuels</SelectItem>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setFilters({ number: '', type: 'all', brand: '', fuel: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingVehicle(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="number">Vehicle Number</Label>
                  <Input
                    id="number"
                    placeholder="MH12AB1234"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Vehicle Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as VehicleType })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2W">2 Wheeler</SelectItem>
                        <SelectItem value="3W">3 Wheeler</SelectItem>
                        <SelectItem value="4W">4 Wheeler</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fuel">Fuel Type</Label>
                    <Select value={formData.fuel} onValueChange={(value) => setFormData({ ...formData, fuel: value as FuelType })}>
                      <SelectTrigger id="fuel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="Maruti"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="Swift"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="w-full" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full">
                    {editingVehicle ? 'Update' : 'Add'} Vehicle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Vehicles ({filteredVehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No vehicles added yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.number}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.fuel}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="default" size="sm" onClick={() => handleBookVehicle(vehicle)}>
                            Book
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(vehicle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}

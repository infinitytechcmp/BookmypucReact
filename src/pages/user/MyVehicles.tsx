import { useEffect, useState } from 'react';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Vehicle, VehicleType, FuelType } from '@/types/types';

export default function MyVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Vehicles</h2>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Your Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
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
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.number}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.fuel}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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

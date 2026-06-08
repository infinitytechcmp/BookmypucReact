import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { authService } from '@/services/authService';
import { vehicleService } from '@/services/vehicleService';
import { Plus, Filter } from 'lucide-react';
import type { User, Vehicle } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'all'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [vehiclesMap, setVehiclesMap] = useState<Record<number, Vehicle[]>>({});
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [selectedUserForVehicles, setSelectedUserForVehicles] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const [allUsers, allVehicles] = await Promise.all([
      adminService.getAllUsers(),
      vehicleService.getAllVehicles()
    ]);
    setUsers(allUsers);

    const map: Record<number, Vehicle[]> = {};
    allVehicles.forEach((v) => {
      const uid = v.userId || (v as any).user_id;
      if (uid) {
        if (!map[uid]) map[uid] = [];
        map[uid].push(v);
      }
    });
    setVehiclesMap(map);
  };

  const handleViewVehicles = (user: User) => {
    setSelectedUserForVehicles(user);
    setIsVehicleDialogOpen(true);
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (newStatus === 'active') {
      const success = await adminService.activateUser(userId);
      if (success) {
        toast.success('User activated successfully');
        await loadUsers();
      }
    } else {
      const success = await adminService.deactivateUser(userId);
      if (success) {
        toast.success('User deactivated successfully');
        await loadUsers();
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
        role: 'user'
      });

      if (success) {
        toast.success('User added successfully');
        await loadUsers();
        handleCloseDialog();
      } else {
        toast.error('Failed to add user. Email may already exist.');
      }
    } catch (error) {
      toast.error('An error occurred while adding user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
      user.phone.includes(filters.phone) &&
      (filters.status === 'all' || user.status === filters.status)
    );
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <GradientHeading level={2} className="text-3xl font-bold">Users</GradientHeading>
            <p className="text-muted-foreground">Manage registered users</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredUsers} filename="admin_users" title="System Users List" />
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
                      Apply filters to the users list.
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
                      <Label htmlFor="filter-phone">Phone</Label>
                      <Input
                        id="filter-phone"
                        placeholder="Filter Phone..."
                        value={filters.phone}
                        onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
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
                    onClick={() => setFilters({ name: '', email: '', phone: '', status: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {(() => {
                        const userVehicles = vehiclesMap[user.id] || [];
                        if (userVehicles.length === 0) return <span className="text-muted-foreground text-xs">No Vehicles</span>;
                        const first = userVehicles[0];
                        return (
                          <div className="flex items-center gap-2">
                            <div className="text-sm flex flex-col">
                              <span className="font-medium">{first.number}</span>
                              <span className="text-xs text-muted-foreground capitalize">{first.type}</span>
                            </div>
                            {userVehicles.length > 1 && (
                              <Badge 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-secondary/80 text-xs px-1.5 py-0 h-5"
                                onClick={() => handleViewVehicles(user)}
                              >
                                +{userVehicles.length - 1}
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVehicles(user)}
                        >
                          User's Vehicles
                        </Button>
                        <Button
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
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
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
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
                  placeholder="8308544837"
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
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedUserForVehicles?.name}'s Vehicles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedUserForVehicles && vehiclesMap[selectedUserForVehicles.id] && vehiclesMap[selectedUserForVehicles.id].length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Fuel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiclesMap[selectedUserForVehicles.id].map(vehicle => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.number}</TableCell>
                        <TableCell className="capitalize">{vehicle.type}</TableCell>
                        <TableCell className="capitalize">{vehicle.fuel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No vehicles found for this user.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

import { useEffect, useState } from 'react';
import { ShopOwnerDashboardLayout } from '@/components/layouts/ShopOwnerDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { centerService } from '@/services/centerService';
import { getMockData } from '@/data/mockData';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileCheck, Calendar, Filter } from 'lucide-react';
import type { Booking } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';
import { GradientHeading } from '@/components/ui/gradient-heading';

const getVehicleTypeLabel = (type: string | undefined) => {
  if (!type) return '';
  const map: Record<string, string> = {
    '2W': 'Two Wheeler',
    '3W': 'Three Wheeler',
    '4W': 'Four Wheeler',
    'Commercial': 'Commercial'
  };
  return map[type] || type;
};

export default function ShopOwnerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({
    user: '',
    centerId: 'all',
    status: 'all',
    date: ''
  });
  const [markDoneDialog, setMarkDoneDialog] = useState<{ open: boolean; bookingId: number | null }>({
    open: false,
    bookingId: null
  });
const [pucData, setPucData] = useState<{
  pucNumber: string;
  certificate: File | null;
}>({
  pucNumber: '',
  certificate: null
});
  const [centers, setCenters] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const ownerBookings = await bookingService.getBookingsByShopOwnerId(user.id);
    const ownerCenters = await centerService.getCentersByOwnerId(user.id);
    setBookings(ownerBookings);
    setCenters(ownerCenters.map(c => ({ id: c.id, name: c.name })));
  };

  const handleConfirmBooking = async (bookingId: number) => {
    const success = await bookingService.confirmBooking(bookingId);
    if (success) {
      toast.success('Booking confirmed! User has been notified.', {
        description: 'Appointment date set to 2 days from now'
      });
      await loadData();
    } else {
      toast.error('Failed to confirm booking');
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    const success = await bookingService.rejectBooking(bookingId);
    if (success) {
      toast.success('Booking rejected. User has been notified.');
      await loadData();
    } else {
      toast.error('Failed to reject booking');
    }
  };

const handleMarkAsDone = async () => {
  if (!markDoneDialog.bookingId || !pucData.pucNumber) {
    toast.error('Please enter PUC number');
    return;
  }

  if (!pucData.certificate) {
    toast.error('Please upload certificate');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('id', String(markDoneDialog.bookingId));
    formData.append('puc_number', pucData.pucNumber);
    formData.append('certificate', pucData.certificate); // ✅ FILE

    const result = await bookingService.markBookingAsDone(formData);

    console.log('MARK DONE RESPONSE:', result);

    if (result.success) {
      toast.success('PUC Certificate Generated! 🎉', {
        description: 'User has been notified'
      });

      setMarkDoneDialog({ open: false, bookingId: null });
      setPucData({ pucNumber: '', certificate: null });

      await loadData();
    } else {
      toast.error(result.message || 'Failed to mark booking as done');
    }

  } catch (error) {
    console.error(error);
    toast.error('Upload failed');
  }
};

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      done: { variant: 'secondary', label: 'Done' },
      cancelled: { variant: 'destructive', label: 'Cancelled' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUserName = (userId: number) => {
    const mockData = getMockData();
    const user = mockData.users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const getUserDetails = (booking: any) => {
    // Try to get from API response first
    if (booking.user_name || booking.user_email) {
      return (
        <div>
          <p className="font-medium text-foreground">{booking.user_name || 'N/A'}</p>
          {booking.user_email && <p className="text-xs text-muted-foreground">{booking.user_email}</p>}
        </div>
      );
    }
    
    // Fallback to mock data
    const mockData = getMockData();
    const user = mockData.users.find(u => u.id === booking.user_id);
    if (user) {
      return (
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      );
    }
    
    return <span className="text-muted-foreground">Unknown</span>;
  };

  const getVehicleDetails = (booking: any) => {
    // Try to get from API response first
    if (booking.vehicle_number) {
      const typeLabel = getVehicleTypeLabel(booking.vehicle_type);
      return (
        <div>
          <p className="font-medium text-foreground uppercase">{booking.vehicle_number}</p>
          {(typeLabel || booking.vehicle_fuel) && (
            <p className="text-xs text-muted-foreground capitalize">
              {typeLabel} {booking.vehicle_fuel ? `(${booking.vehicle_fuel})` : ''}
            </p>
          )}
        </div>
      );
    }
    
    // Fallback to mock data
    const mockData = getMockData();
    const vehicle = mockData.vehicles.find(v => v.id === booking.vehicle_id);
    if (vehicle) {
      const typeLabel = getVehicleTypeLabel(vehicle.type);
      return (
        <div>
          <p className="font-medium text-foreground uppercase">{vehicle.number}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {typeLabel} {vehicle.fuel ? `(${vehicle.fuel})` : ''}
          </p>
        </div>
      );
    }
    return <span className="text-muted-foreground">N/A</span>;
  };

  const getCenterName = (centerId: number) => {
    const center = centers.find(c => c.id === centerId);
    return center?.name || 'Unknown';
  };

  const filteredBookings = bookings.filter((b) => {
    const uName = ((b as any).user_name || getUserName(b.user_id)).toLowerCase();
    const matchesUser = uName.includes(filters.user.toLowerCase());
    const matchesCenter = filters.centerId === 'all' || b.center_id.toString() === filters.centerId;
    const matchesStatus = filters.status === 'all' || b.status === filters.status;
    const matchesDate = !filters.date || b.date.includes(filters.date);
    
    return matchesUser && matchesCenter && matchesStatus && matchesDate;
  });

  return (
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <GradientHeading level={2} className="text-3xl font-bold">Bookings Management</GradientHeading>
            <p className="text-muted-foreground">Confirm, reject, and manage customer bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredBookings} filename="center_bookings" title="Bookings Management List" />
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
                    Apply filters to the bookings list.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-user">User</Label>
                    <Input
                      id="filter-user"
                      placeholder="Filter User..."
                      value={filters.user}
                      onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-center">Center</Label>
                    <Select
                      value={filters.centerId}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, centerId: value }))}
                    >
                      <SelectTrigger id="filter-center" className="col-span-2 h-8">
                        <SelectValue placeholder="All Centers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Centers</SelectItem>
                        {centers.map(center => (
                          <SelectItem key={center.id} value={center.id.toString()}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-date">Date</Label>
                    <Input
                      id="filter-date"
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setFilters({ user: '', centerId: 'all', date: '', status: 'all' })}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Bookings Table */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{getUserDetails(booking)}</TableCell>
                        <TableCell>{getVehicleDetails(booking)}</TableCell>
                        <TableCell>{getCenterName(booking.center_id)}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell className="font-semibold">₹{booking.price}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectBooking(booking.id)}
                                  className="gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setMarkDoneDialog({ open: true, bookingId: booking.id })}
                                className="gap-1"
                              >
                                <FileCheck className="h-4 w-4" />
                                Mark Done
                              </Button>
                            )}
                            {booking.status === 'done' && (
                              <span className="text-sm text-muted-foreground">
                                PUC: {booking.pucNumber || (booking as any).puc_number}
                              </span>
                            )}
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

        {/* Mark as Done Dialog */}
        <Dialog open={markDoneDialog.open} onOpenChange={(open) => setMarkDoneDialog({ open, bookingId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Booking as Done</DialogTitle>
              <DialogDescription>
                Enter PUC certificate details to complete this booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pucNumber">PUC Number *</Label>
                <Input
                  id="pucNumber"
                  placeholder="Enter PUC certificate number"
                  value={pucData.pucNumber}
                  onChange={(e) => setPucData({ ...pucData, pucNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="certificate">Certificate File (Optional)</Label>
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPucData({ ...pucData, certificate: file });
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMarkDoneDialog({ open: false, bookingId: null })}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsDone}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShopOwnerDashboardLayout>
  );
}

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
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { centerService } from '@/services/centerService';
import { getMockData } from '@/data/mockData';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileCheck, Calendar } from 'lucide-react';
import type { Booking } from '@/types/types';

export default function ShopOwnerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [markDoneDialog, setMarkDoneDialog] = useState<{ open: boolean; bookingId: number | null }>({
    open: false,
    bookingId: null
  });
  const [pucData, setPucData] = useState({ pucNumber: '', certificate: '' });
  const [centers, setCenters] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [bookings, selectedCenter, selectedStatus]);

  const loadData = async () => {
    if (!user) return;
    const ownerBookings = await bookingService.getBookingsByShopOwnerId(user.id);
    const ownerCenters = await centerService.getCentersByOwnerId(user.id);
    setBookings(ownerBookings);
    setCenters(ownerCenters.map(c => ({ id: c.id, name: c.name })));
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    
    if (selectedCenter !== 'all') {
      filtered = filtered.filter(b => b.centerId === parseInt(selectedCenter));
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(b => b.status === selectedStatus);
    }
    
    setFilteredBookings(filtered);
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

    const success = await bookingService.markBookingAsDone(
      markDoneDialog.bookingId,
      pucData.pucNumber,
      pucData.certificate || 'certificate.pdf'
    );

    if (success) {
      toast.success('PUC Certificate Generated! 🎉', {
        description: 'User has been notified'
      });
      setMarkDoneDialog({ open: false, bookingId: null });
      setPucData({ pucNumber: '', certificate: '' });
      await loadData();
    } else {
      toast.error('Failed to mark booking as done');
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

  const getVehicleNumber = (vehicleId: number) => {
    const mockData = getMockData();
    const vehicle = mockData.vehicles.find(v => v.id === vehicleId);
    return vehicle?.number || 'N/A';
  };

  const getCenterName = (centerId: number) => {
    const center = centers.find(c => c.id === centerId);
    return center?.name || 'Unknown';
  };

  return (
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold">Bookings Management</h2>
          <p className="text-muted-foreground">Confirm, reject, and manage customer bookings</p>
        </div>

        {/* Filters */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label>Center</Label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
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
              <div className="flex-1 min-w-[200px]">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
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
          </CardContent>
        </Card>

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
                        <TableCell>{getUserName(booking.userId)}</TableCell>
                        <TableCell>{getVehicleNumber(booking.vehicleId)}</TableCell>
                        <TableCell>{getCenterName(booking.centerId)}</TableCell>
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
                                PUC: {booking.pucNumber}
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
                      setPucData({ ...pucData, certificate: file.name });
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

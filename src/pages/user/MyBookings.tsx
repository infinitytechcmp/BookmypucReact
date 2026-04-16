import { useEffect, useState } from 'react';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { centerService } from '@/services/centerService';
import { vehicleService } from '@/services/vehicleService';
import type { Booking, Center, Vehicle } from '@/types/types';
import { FILE_BASE_URL } from '@/config/api';
import { Filter } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [centers, setCenters] = useState<Record<number, Center>>({});
  const [vehicles, setVehicles] = useState<Record<number, Vehicle>>({});
  const [filters, setFilters] = useState({
    centerName: '',
    date: '',
    vehicle: '',
    status: 'all'
  });

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (user) {
      const userBookings = await bookingService.getBookingsByUserId(user.id);
      setBookings(userBookings);
      
      // Load centers and vehicles for display
      const centersMap: Record<number, Center> = {};
      const vehiclesMap: Record<number, Vehicle> = {};
      
      for (const booking of userBookings) {
        if (!centersMap[booking.center_id]) {
          const center = await centerService.getCenterById(booking.center_id);
          if (center) centersMap[booking.center_id] = center;
        }
        if (!vehiclesMap[booking.vehicle_id]) {
          const vehicle = await vehicleService.getVehicleById(booking.vehicle_id);
          if (vehicle) vehiclesMap[booking.vehicle_id] = vehicle;
        }
      }
      
      setCenters(centersMap);
      setVehicles(vehiclesMap);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    const success = await bookingService.cancelBooking(bookingId);
    if (success) {
      toast.success('Booking cancelled successfully');
      await loadBookings();
    } else {
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      done: 'secondary',
      cancelled: 'destructive',
      pending: 'outline'
    };
    return variants[status] || 'outline';
  };

  const filteredBookings = bookings.filter((booking) => {
    const centerName = centers[booking.center_id]?.name || '';
    const vehicleNumber = vehicles[booking.vehicle_id]?.number || '';
    
    const matchesCenter = centerName.toLowerCase().includes(filters.centerName.toLowerCase());
    const matchesDate = !filters.date || booking.date.includes(filters.date);
    const matchesVehicle = vehicleNumber.toLowerCase().includes(filters.vehicle.toLowerCase());
    const matchesStatus = filters.status === 'all' || booking.status === filters.status;
    
    return matchesCenter && matchesDate && matchesVehicle && matchesStatus;
  });

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <p className="text-muted-foreground">View and manage your PUC appointments</p>
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
                  <p className="text-sm text-muted-foreground">Apply filters to the bookings list.</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="filter-center">Center</Label>
                    <Input
                      id="filter-center"
                      placeholder="Center Name..."
                      value={filters.centerName}
                      onChange={(e) => setFilters(prev => ({ ...prev, centerName: e.target.value }))}
                      className="col-span-2 h-8"
                    />
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
                    <Label htmlFor="filter-vehicle">Vehicle</Label>
                    <Input
                      id="filter-vehicle"
                      placeholder="Vehicle Number..."
                      value={filters.vehicle}
                      onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
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
                  onClick={() => setFilters({ centerName: '', date: '', vehicle: '', status: 'all' })}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Center Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const center = centers[booking.center_id];
                      const vehicle = vehicles[booking.vehicle_id];

                      console.log(vehicle);
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{center?.name || 'Loading...'}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell>{vehicle?.number || 'Loading...'}</TableCell>
                          <TableCell>₹{booking.price}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'confirmed' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking.status === 'done' && booking.certificate && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={ FILE_BASE_URL + booking.certificate} target="_blank" rel="noopener noreferrer">
                                  View Certificate
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
}

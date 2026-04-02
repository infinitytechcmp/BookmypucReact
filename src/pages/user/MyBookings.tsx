import { useEffect, useState } from 'react';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [centers, setCenters] = useState<Record<number, Center>>({});
  const [vehicles, setVehicles] = useState<Record<number, Vehicle>>({});

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

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">My Bookings</h2>
          <p className="text-muted-foreground">View and manage your PUC appointments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
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
                    {bookings.map((booking) => {
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

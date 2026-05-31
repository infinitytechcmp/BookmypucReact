import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { bookingService } from '@/services/bookingService';
import { Calendar, Filter, Eye, FileText, CheckCircle, Clock, Ban, DollarSign } from 'lucide-react';
import type { Booking } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';
import { FILE_BASE_URL } from '@/config/api';

interface AdminBooking extends Booking {
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  center_name?: string;
  center_address?: string;
  city?: string;
  state?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_fuel?: string;
}

const getVehicleTypeLabel = (type: string | undefined) => {
  if (!type) return 'N/A';
  const map: Record<string, string> = {
    '2W': 'Two Wheeler',
    '3W': 'Three Wheeler',
    '4W': 'Four Wheeler',
    'Commercial': 'Commercial'
  };
  return map[type] || type;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [filters, setFilters] = useState({
    user: '',
    center: '',
    vehicle: '',
    status: 'all',
    date: ''
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await bookingService.getAllBookings();
      setBookings(allBookings as AdminBooking[]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
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

  const filteredBookings = bookings.filter((b) => {
    const matchesUser = !filters.user || (b.user_name || '').toLowerCase().includes(filters.user.toLowerCase());
    const matchesCenter = !filters.center || (b.center_name || '').toLowerCase().includes(filters.center.toLowerCase());
    const matchesVehicle = !filters.vehicle || (b.vehicle_number || '').toLowerCase().includes(filters.vehicle.toLowerCase());
    const matchesStatus = filters.status === 'all' || b.status === filters.status;
    const matchesDate = !filters.date || b.date.includes(filters.date);

    return matchesUser && matchesCenter && matchesVehicle && matchesStatus && matchesDate;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'done').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => (b.status === 'done' ? sum + Number(b.price) : sum), 0)
  };

  const handleViewDetails = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings List</h2>
            <p className="text-muted-foreground">Monitor and inspect all pollution certificate bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredBookings} filename="admin_bookings" title="System Bookings List" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter bookings by various criteria.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-user" className="text-right">Customer</Label>
                      <Input
                        id="filter-user"
                        placeholder="Name..."
                        value={filters.user}
                        onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-center" className="text-right">Center</Label>
                      <Input
                        id="filter-center"
                        placeholder="Center name..."
                        value={filters.center}
                        onChange={(e) => setFilters(prev => ({ ...prev, center: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-vehicle" className="text-right">Vehicle</Label>
                      <Input
                        id="filter-vehicle"
                        placeholder="MH12AB1234..."
                        value={filters.vehicle}
                        onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-date" className="text-right">Date</Label>
                      <Input
                        id="filter-date"
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-status" className="text-right">Status</Label>
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
                    onClick={() => setFilters({ user: '', center: '', vehicle: '', status: 'all', date: '' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.cancelled}</div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Done)</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card className="border-2 border-border/50 bg-background/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Bookings List ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <Clock className="mx-auto mb-4 h-10 w-10 animate-spin opacity-50" />
                <p>Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-30" />
                <p>No bookings found matching filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>PUC Center</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-semibold">#{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{booking.user_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{booking.user_phone || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{booking.vehicle_number || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {getVehicleTypeLabel(booking.vehicle_type)} ({booking.vehicle_fuel})
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.center_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{booking.date}</p>
                            <p className="text-xs text-muted-foreground">{booking.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">₹{booking.price}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(booking)}
                            className="h-8 w-8 p-0"
                            title="View Booking Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
              <DialogDescription>
                Detailed overview for Booking #{selectedBooking?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 border-b pb-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Status</span>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Booking Price</span>
                    <p className="text-lg font-bold text-foreground mt-0.5">₹{selectedBooking.price}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold border-l-2 border-primary pl-2 text-foreground">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Name</span>
                      <p className="font-medium text-foreground">{selectedBooking.user_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Phone</span>
                      <p className="font-medium text-foreground">{selectedBooking.user_phone || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <p className="font-medium text-foreground">{selectedBooking.user_email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <h4 className="text-sm font-semibold border-l-2 border-primary pl-2 text-foreground">Vehicle Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Registration No.</span>
                      <p className="font-medium text-foreground uppercase">{selectedBooking.vehicle_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Vehicle Type</span>
                      <p className="font-medium text-foreground capitalize">{selectedBooking.vehicle_type || 'N/A'}</p>
                    </div>
                    {/* 
                    <div>
                      <span className="text-xs text-muted-foreground">Brand & Model</span>
                      <p className="font-medium text-foreground">{selectedBooking.vehicle_brand} {selectedBooking.vehicle_model}</p>
                    </div>
                    */}
                    <div>
                      <span className="text-xs text-muted-foreground">Fuel Type</span>
                      <p className="font-medium text-foreground capitalize">{selectedBooking.vehicle_fuel || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <h4 className="text-sm font-semibold border-l-2 border-primary pl-2 text-foreground">PUC Center Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-2">
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Center Name</span>
                      <p className="font-medium text-foreground">{selectedBooking.center_name || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Address</span>
                      <p className="text-xs text-foreground">
                        {selectedBooking.center_address}, {selectedBooking.city}, {selectedBooking.state}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedBooking.status === 'done' && (
                  <div className="space-y-3 pt-1 border-t mt-2">
                    <h4 className="text-sm font-semibold text-foreground">PUC Certificate Information</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-xs text-muted-foreground">PUC Number</span>
                        <span className="font-mono font-semibold text-foreground">
                          {selectedBooking.pucNumber || (selectedBooking as any).puc_number || 'N/A'}
                        </span>
                      </div>
                      {selectedBooking.certificate && (
                        <div className="pt-2 text-center">
                          <a
                            href={FILE_BASE_URL + selectedBooking.certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            View Certificate Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { vehicleService } from '@/services/vehicleService';
import { centerService } from '@/services/centerService';
import { Calendar, Car, CheckCircle2, Clock, TrendingUp, IndianRupee, BarChart3, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Booking, Vehicle, Center } from '@/types/types';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [centers, setCenters] = useState<Record<number, Center>>({});
  const [vehiclesMap, setVehiclesMap] = useState<Record<number, Vehicle>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    vehiclesAdded: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedVehicle, selectedStatus]);

  const loadData = async () => {
    if (!user) return;

    let userBookings = await bookingService.getBookingsByUserId(user.id);
    const userVehicles = await vehicleService.getVehiclesByUserId(user.id);
    
    // Apply filters
    if (selectedVehicle !== 'all') {
      userBookings = userBookings.filter(b => b.vehicleId === parseInt(selectedVehicle));
    }
    if (selectedStatus !== 'all') {
      userBookings = userBookings.filter(b => b.status === selectedStatus);
    }

    setBookings(userBookings);
    setVehicles(userVehicles);

    // Load centers and vehicles for display
    const centersMap: Record<number, Center> = {};
    const vehiclesMapData: Record<number, Vehicle> = {};
    
    for (const booking of userBookings) {
      if (!centersMap[booking.centerId]) {
        const center = await centerService.getCenterById(booking.centerId);
        if (center) centersMap[booking.centerId] = center;
      }
      if (!vehiclesMapData[booking.vehicleId]) {
        const vehicle = await vehicleService.getVehicleById(booking.vehicleId);
        if (vehicle) vehiclesMapData[booking.vehicleId] = vehicle;
      }
    }
    
    setCenters(centersMap);
    setVehiclesMap(vehiclesMapData);

    // Calculate stats
    const allBookings = await bookingService.getBookingsByUserId(user.id);
    const bookingStats = await bookingService.getUserBookingStats(user.id);
    const totalSpent = allBookings.reduce((sum, booking) => sum + booking.price, 0);

    setStats({
      totalBookings: bookingStats.totalBookings,
      upcomingBookings: bookingStats.upcomingBookings,
      completedBookings: allBookings.filter(b => b.status === 'done').length,
      totalSpent,
      vehiclesAdded: userVehicles.length
    });
  };

  // Prepare chart data
  const getBookingTrendData = () => {
    const monthlyData: Record<string, number> = {};
    bookings.forEach(booking => {
      const month = booking.date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      bookings: count
    }));
  };

  const getVehicleWiseData = () => {
    const vehicleData: Record<string, number> = {};
    bookings.forEach(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      if (vehicle) {
        const key = `${vehicle.number}`;
        vehicleData[key] = (vehicleData[key] || 0) + 1;
      }
    });
    return Object.entries(vehicleData).map(([vehicle, count]) => ({
      vehicle,
      bookings: count
    }));
  };

  const getSpendingData = () => {
    const monthlySpending: Record<string, number> = {};
    bookings.forEach(booking => {
      const month = booking.date.substring(0, 7);
      monthlySpending[month] = (monthlySpending[month] || 0) + booking.price;
    });
    return Object.entries(monthlySpending).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  const getStatusDistribution = () => {
    const statusCount: Record<string, number> = {};
    bookings.forEach(booking => {
      statusCount[booking.status] = (statusCount[booking.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Upcoming', value: stats.upcomingBookings, icon: Clock, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
    { title: 'Completed', value: stats.completedBookings, icon: CheckCircle2, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
    { title: 'Total Spent', value: `₹${stats.totalSpent}`, icon: IndianRupee, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
    { title: 'Vehicles', value: stats.vehiclesAdded, icon: Car, color: 'text-primary', bgColor: 'bg-primary/10' }
  ];

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Dashboard Analytics</h2>
            <p className="text-muted-foreground">Comprehensive overview of your PUC bookings</p>
          </div>
          <Button asChild className="shadow-lg">
            <Link to="/find-centers">Book New PUC</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="group overflow-hidden border-2 border-border/50 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl ${stat.bgColor} p-3 transition-transform group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-2 block text-sm font-medium">Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.number} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="mb-2 block text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Booking Trend */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Booking Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getBookingTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle-wise Bookings */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-chart-2" />
                Vehicle-wise Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getVehicleWiseData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="vehicle" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Spending Over Time */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-chart-3" />
                Spending Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getSpendingData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-3))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-4" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Center</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking) => {
                      const center = centers[booking.centerId];
                      const vehicle = vehiclesMap[booking.vehicleId];
                      
                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{center?.name || 'Loading...'}</TableCell>
                          <TableCell>{vehicle?.number || 'Loading...'}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell className="font-semibold">₹{booking.price}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
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

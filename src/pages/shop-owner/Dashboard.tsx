import { useEffect, useState } from 'react';
import { ShopOwnerDashboardLayout } from '@/components/layouts/ShopOwnerDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { centerService } from '@/services/centerService';
import { bookingService } from '@/services/bookingService';
import { Building2, Calendar, Clock, CheckCircle2, IndianRupee, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Booking, Center } from '@/types/types';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function ShopOwnerDashboard() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    totalCenters: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedCenter, selectedStatus]);

  const loadData = async () => {
    if (!user) return;

    const ownerCenters = await centerService.getCentersByOwnerId(user.id);
    setCenters(ownerCenters);

    let allBookings: Booking[] = [];
    for (const center of ownerCenters) {
      const centerBookings = await bookingService.getBookingsByCenterId(center.id);
      allBookings = [...allBookings, ...centerBookings];
    }

    // Apply filters
    if (selectedCenter !== 'all') {
      allBookings = allBookings.filter(b => b.centerId === parseInt(selectedCenter));
    }
    if (selectedStatus !== 'all') {
      allBookings = allBookings.filter(b => b.status === selectedStatus);
    }

    setBookings(allBookings);

    // Calculate stats
    const bookingStats = await bookingService.getShopOwnerBookingStats(user.id);
    const totalRevenue = allBookings.filter(b => b.status === 'done').reduce((sum, b) => sum + b.price, 0);

    setStats({
      totalCenters: ownerCenters.length,
      totalBookings: bookingStats.totalBookings,
      pendingBookings: bookingStats.pendingBookings,
      completedBookings: bookingStats.completedBookings,
      totalRevenue
    });
  };

  // Chart data
  const getCenterWiseBookings = () => {
    const centerData: Record<string, number> = {};
    bookings.forEach(booking => {
      const center = centers.find(c => c.id === booking.centerId);
      if (center) {
        centerData[center.name] = (centerData[center.name] || 0) + 1;
      }
    });
    return Object.entries(centerData).map(([name, count]) => ({
      center: name,
      bookings: count
    }));
  };

  const getCenterWiseRevenue = () => {
    const revenueData: Record<string, number> = {};
    bookings.filter(b => b.status === 'done').forEach(booking => {
      const center = centers.find(c => c.id === booking.centerId);
      if (center) {
        revenueData[center.name] = (revenueData[center.name] || 0) + booking.price;
      }
    });
    return Object.entries(revenueData).map(([name, revenue]) => ({
      center: name,
      revenue
    }));
  };

  const getBookingTrend = () => {
    const monthlyData: Record<string, number> = {};
    bookings.forEach(booking => {
      const month = booking.date.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      bookings: count
    }));
  };

  const getRevenueTrend = () => {
    const monthlyRevenue: Record<string, number> = {};
    bookings.filter(b => b.status === 'done').forEach(booking => {
      const month = booking.date.substring(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.price;
    });
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
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
    { title: 'Total Centers', value: stats.totalCenters, icon: Building2, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
    { title: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'Completed', value: stats.completedBookings, icon: CheckCircle2, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: 'text-chart-4', bgColor: 'bg-chart-4/10' }
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
    <ShopOwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <GradientHeading level={2} className="text-3xl font-bold">Dashboard Analytics</GradientHeading>
          <p className="text-muted-foreground">Center-wise performance and booking analytics</p>
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
                <label className="mb-2 block text-sm font-medium">Center</label>
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
          {/* Center-wise Bookings */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Center-wise Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCenterWiseBookings()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="center" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Center-wise Revenue */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-chart-2" />
                Center-wise Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCenterWiseRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="center" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Booking Trend */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-3" />
                Booking Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getBookingTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-4" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getRevenueTrend()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
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
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking) => {
                      const center = centers.find(c => c.id === booking.centerId);
                      
                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>{center?.name}</TableCell>
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
    </ShopOwnerDashboardLayout>
  );
}

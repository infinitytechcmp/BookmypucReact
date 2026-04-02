import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/adminService';
import { bookingService } from '@/services/bookingService';
import { getMockData } from '@/data/mockData';
import { Calendar, DollarSign, Users, Building2, TrendingUp, BarChart3, Filter, UserCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { User, ShopOwner, Booking } from '@/types/types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedShopOwner, setSelectedShopOwner] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeCenters: 0,
    activeShopOwners: 0,
    totalUsers: 0
  });

  useEffect(() => {
    loadData();
  }, [selectedShopOwner, selectedTimeRange]);

  const loadData = async () => {
    const dashboardStats = await adminService.getDashboardStats();
    const allUsers = await adminService.getAllUsers();
    const allShopOwners = await adminService.getAllShopOwners();
    const mockData = getMockData();
    let allBookings = mockData.bookings;

    // Apply shop owner filter
    if (selectedShopOwner !== 'all') {
      const ownerCenterIds = mockData.centers
        .filter(c => c.ownerId === parseInt(selectedShopOwner))
        .map(c => c.id);
      allBookings = allBookings.filter(b => ownerCenterIds.includes(b.centerId));
    }

    // Apply time range filter
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      if (selectedTimeRange === '7days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (selectedTimeRange === '30days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (selectedTimeRange === '90days') {
        filterDate.setDate(now.getDate() - 90);
      }
      allBookings = allBookings.filter(b => new Date(b.date) >= filterDate);
    }

    setUsers(allUsers);
    setShopOwners(allShopOwners);
    setBookings(allBookings);

    const totalRevenue = allBookings.filter(b => b.status === 'done').reduce((sum, b) => sum + b.price, 0);

    setStats({
      ...dashboardStats,
      totalRevenue,
      totalUsers: allUsers.length,
      activeShopOwners: allShopOwners.filter(s => s.status === 'active').length
    });
  };

  // Chart data
  const getUserWiseBookings = () => {
    const userData: Record<string, number> = {};
    bookings.forEach(booking => {
      const user = users.find(u => u.id === booking.userId);
      if (user) {
        userData[user.name] = (userData[user.name] || 0) + 1;
      }
    });
    return Object.entries(userData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        user: name,
        bookings: count
      }));
  };

  const getShopOwnerWiseRevenue = () => {
    const revenueData: Record<string, number> = {};
    bookings.filter(b => b.status === 'done').forEach(booking => {
      const mockData = getMockData();
      const center = mockData.centers.find(c => c.id === booking.centerId);
      if (center) {
        const owner = shopOwners.find(o => o.id === center.ownerId);
        if (owner) {
          revenueData[owner.name] = (revenueData[owner.name] || 0) + booking.price;
        }
      }
    });
    return Object.entries(revenueData).map(([name, revenue]) => ({
      owner: name,
      revenue
    }));
  };

  const getPlatformGrowth = () => {
    const monthlyData: Record<string, { users: number; bookings: number; revenue: number }> = {};
    
    bookings.forEach(booking => {
      const month = booking.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { users: 0, bookings: 0, revenue: 0 };
      }
      monthlyData[month].bookings += 1;
      if (booking.status === 'done') {
        monthlyData[month].revenue += booking.price;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  };

  const getUserActivityDistribution = () => {
    const activityData: Record<string, number> = {};
    users.forEach(user => {
      const userBookings = bookings.filter(b => b.userId === user.id).length;
      if (userBookings === 0) activityData['Inactive'] = (activityData['Inactive'] || 0) + 1;
      else if (userBookings <= 2) activityData['Low Activity'] = (activityData['Low Activity'] || 0) + 1;
      else if (userBookings <= 5) activityData['Medium Activity'] = (activityData['Medium Activity'] || 0) + 1;
      else activityData['High Activity'] = (activityData['High Activity'] || 0) + 1;
    });
    return Object.entries(activityData).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getShopOwnerPerformance = () => {
    const performanceData: Record<string, { bookings: number; revenue: number }> = {};
    const mockData = getMockData();
    
    bookings.forEach(booking => {
      const center = mockData.centers.find(c => c.id === booking.centerId);
      if (center) {
        const owner = shopOwners.find(o => o.id === center.ownerId);
        if (owner) {
          if (!performanceData[owner.name]) {
            performanceData[owner.name] = { bookings: 0, revenue: 0 };
          }
          performanceData[owner.name].bookings += 1;
          if (booking.status === 'done') {
            performanceData[owner.name].revenue += booking.price;
          }
        }
      }
    });

    return Object.entries(performanceData).map(([owner, data]) => ({
      owner,
      ...data
    }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
    { title: 'Active Centers', value: stats.activeCenters, icon: Building2, color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
    { title: 'Shop Owners', value: stats.activeShopOwners, icon: UserCheck, color: 'text-primary', bgColor: 'bg-primary/10' }
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold">Platform Analytics</h2>
          <p className="text-muted-foreground">Comprehensive user and shop owner performance metrics</p>
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
                <label className="mb-2 block text-sm font-medium">Shop Owner</label>
                <Select value={selectedShopOwner} onValueChange={setSelectedShopOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Shop Owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shop Owners</SelectItem>
                    {shopOwners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id.toString()}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="mb-2 block text-sm font-medium">Time Range</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 - Platform Growth */}
        <Card className="border-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={getPlatformGrowth()}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBookings)" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User-wise Bookings */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-chart-3" />
                Top Users by Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getUserWiseBookings()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="user" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Shop Owner-wise Revenue */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-chart-4" />
                Shop Owner Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getShopOwnerWiseRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="owner" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Activity Distribution */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                User Activity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getUserActivityDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getUserActivityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Shop Owner Performance */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-chart-2" />
                Shop Owner Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getShopOwnerPerformance()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="owner" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Users Table */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle>Top Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.slice(0, 5).map((user) => {
                      const userBookings = bookings.filter(b => b.userId === user.id).length;
                      return (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{userBookings}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Shop Owners Table */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle>Top Shop Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopOwners.slice(0, 5).map((owner) => (
                      <TableRow key={owner.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{owner.name}</TableCell>
                        <TableCell>{owner.email}</TableCell>
                        <TableCell>
                          <Badge variant={owner.status === 'active' ? 'default' : 'secondary'}>
                            {owner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={owner.subscription === 'active' ? 'default' : 'outline'}>
                            {owner.subscription}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

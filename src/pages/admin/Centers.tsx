import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Search, MapPin } from 'lucide-react';
import { adminService } from '@/services/adminService';
import type { Center, ShopOwner } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';
import { GradientHeading } from '@/components/ui/gradient-heading';

export default function AdminCenters() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    state: '',
    status: 'all',
    owner_id: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [centersData, ownersData] = await Promise.all([
        adminService.getAllCenters(),
        adminService.getAllShopOwners()
      ]);
      setCenters(centersData);
      setShopOwners(ownersData);
    } catch (error) {
      console.error('Failed to load centers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter((center) => {
    const matchName = (center.name || '').toLowerCase().includes(filters.name.toLowerCase());
    const matchCity = (center.city || '').toLowerCase().includes(filters.city.toLowerCase());
    const matchState = (center.state || '').toLowerCase().includes(filters.state.toLowerCase());
    const matchStatus = filters.status === 'all' || center.status === filters.status;
    const matchOwner = filters.owner_id === 'all' || center.owner_id.toString() === filters.owner_id;
    
    return matchName && matchCity && matchState && matchStatus && matchOwner;
  });

  const getOwnerName = (ownerId: number) => {
    const owner = shopOwners.find(o => o.id === ownerId);
    return owner ? owner.name : `Unknown (${ownerId})`;
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <GradientHeading level={2} className="text-3xl font-bold tracking-tight">PUC Centers</GradientHeading>
            <p className="text-muted-foreground">Monitor and manage all PUC centers</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search centers..."
                className="pl-8"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <ExportButton data={filteredCenters} filename="admin_centers" title="All PUC Centers List" />
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
                    <h4 className="font-medium leading-none">Filter Centers</h4>
                    <p className="text-sm text-muted-foreground">
                      Refine the centers list by specific criteria.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-city">City</Label>
                      <Input
                        id="filter-city"
                        placeholder="e.g. Mumbai"
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-state">State</Label>
                      <Input
                        id="filter-state"
                        placeholder="e.g. Maharashtra"
                        value={filters.state}
                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-owner">Owner</Label>
                      <Select
                        value={filters.owner_id}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, owner_id: value }))}
                      >
                        <SelectTrigger id="filter-owner" className="col-span-2 h-8">
                          <SelectValue placeholder="All Owners" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Owners</SelectItem>
                          {shopOwners.map(owner => (
                            <SelectItem key={owner.id} value={owner.id.toString()}>
                              {owner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-status">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger id="filter-status" className="col-span-2 h-8">
                          <SelectValue placeholder="All Status" />
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
                    className="w-full mt-2"
                    onClick={() => setFilters({ name: '', city: '', state: '', status: 'all', owner_id: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Centers ({filteredCenters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Loading centers...</p>
              </div>
            ) : filteredCenters.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No centers found matching the current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Center Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Shop Owner</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCenters.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="line-clamp-2 text-sm" title={`${center.address}, ${center.city}, ${center.state}`}>{center.address}, {center.city}, {center.state}</span>
                            <span className="text-xs text-muted-foreground">{center.pincode}</span>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}, ${center.city}, ${center.state} ${center.pincode}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 w-fit mt-1"
                            >
                              <MapPin className="h-3 w-3" /> View on Map
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>{center.contact}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {getOwnerName(center.owner_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{center.working_hours}</TableCell>
                        <TableCell>
                          <Badge variant={center.status === 'active' ? 'default' : 'secondary'}>
                            {center.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

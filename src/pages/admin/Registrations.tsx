import { useEffect, useState } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { LICENSE_BASE_URL } from '@/config/api';
import { Filter, Eye, Check, X, FileText, Calendar, MapPin, User, Phone, Mail, Award } from 'lucide-react';
import type { ShopOwnerRegistration } from '@/types/types';
import { ExportButton } from '@/components/ExportButton';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<ShopOwnerRegistration[]>([]);
  const [filters, setFilters] = useState({
    centerName: '',
    ownerName: '',
    status: 'all'
  });
  const [selectedReg, setSelectedReg] = useState<ShopOwnerRegistration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    const allRegs = await adminService.getAllRegistrations();
    setRegistrations(allRegs);
  };

  const handleApprove = async (id: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const success = await adminService.approveRegistration(id);
      if (success) {
        toast.success('Registration approved and shop owner account created successfully');
        if (selectedReg?.id === id) {
          setIsDetailsOpen(false);
          setSelectedReg(null);
        }
        await loadRegistrations();
      } else {
        toast.error('Failed to approve registration');
      }
    } catch (error) {
      toast.error('An error occurred during approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const success = await adminService.rejectRegistration(id);
      if (success) {
        toast.success('Registration request rejected');
        if (selectedReg?.id === id) {
          setIsDetailsOpen(false);
          setSelectedReg(null);
        }
        await loadRegistrations();
      } else {
        toast.error('Failed to reject registration');
      }
    } catch (error) {
      toast.error('An error occurred during rejection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (reg: ShopOwnerRegistration) => {
    setSelectedReg(reg);
    setIsDetailsOpen(true);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    return (
      (reg.center_name || '').toLowerCase().includes(filters.centerName.toLowerCase()) &&
      (reg.owner_name || '').toLowerCase().includes(filters.ownerName.toLowerCase()) &&
      (filters.status === 'all' || reg.status === filters.status)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-2.5 py-1">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none px-2.5 py-1">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-2.5 py-1">
            Pending
          </Badge>
        );
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Shop Owner Registrations</h2>
            <p className="text-muted-foreground">Review and approve or reject shop owner registrations</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={filteredRegistrations} filename="shop_owner_registrations" title="Shop Owner Registrations Queue" />
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
                      Filter the registrations queue.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-center">Center Name</Label>
                      <Input
                        id="filter-center"
                        placeholder="Center Name..."
                        value={filters.centerName}
                        onChange={(e) => setFilters(prev => ({ ...prev, centerName: e.target.value }))}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="filter-owner">Owner Name</Label>
                      <Input
                        id="filter-owner"
                        placeholder="Owner Name..."
                        value={filters.ownerName}
                        onChange={(e) => setFilters(prev => ({ ...prev, ownerName: e.target.value }))}
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
                          <SelectItem value="all">All Registrations</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setFilters({ centerName: '', ownerName: '', status: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card className="border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Registration Applications ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Center Name</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No registration requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id} className="transition-colors hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">#{reg.id}</TableCell>
                      <TableCell className="font-semibold">{reg.center_name}</TableCell>
                      <TableCell>{reg.owner_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-foreground">{reg.email}</span>
                          <span className="text-xs text-muted-foreground">{reg.contact}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(reg.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reg.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(reg)}
                            title="View Details"
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {reg.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleApprove(reg.id)}
                                disabled={isProcessing}
                                title="Approve"
                                className="h-8 w-8 text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-200 dark:border-emerald-900"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleReject(reg.id)}
                                disabled={isProcessing}
                                title="Reject"
                                className="h-8 w-8 text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200 dark:border-rose-900"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Application Details
              </DialogTitle>
              <DialogDescription>
                Detailed information for #{selectedReg?.id} registered on{' '}
                {selectedReg && new Date(selectedReg.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedReg && (
              <div className="space-y-6 mt-4">
                {/* 2-column details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop Owner Info */}
                  <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                      <User className="h-4 w-4 text-primary" />
                      Shop Owner Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Owner Name</span>
                        <span className="font-medium text-foreground">{selectedReg.owner_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Email Address</span>
                        <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {selectedReg.email}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Contact Number</span>
                        <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {selectedReg.contact}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center details */}
                  <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                      <Award className="h-4 w-4 text-primary" />
                      Center Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Center Name</span>
                        <span className="font-medium text-foreground">{selectedReg.center_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Center Address</span>
                        <span className="font-medium text-foreground flex items-start gap-1.5 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{selectedReg.address}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Petrol Code</span>
                          <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs mt-1 w-fit">
                            {selectedReg.center_code_petrol || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Diesel Code</span>
                          <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs mt-1 w-fit">
                            {selectedReg.center_code_diesel || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document preview & download row */}
                <div className="border border-border/60 rounded-xl p-4 bg-muted/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Center License Document</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {selectedReg.center_license_document}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`${LICENSE_BASE_URL}${selectedReg.center_license_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 shrink-0 w-full md:w-auto"
                  >
                    View License Document
                  </a>
                </div>

                {/* Footer status/actions */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-sm text-muted-foreground mr-2">Status:</span>
                    {getStatusBadge(selectedReg.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Close
                    </Button>
                    {selectedReg.status === 'pending' && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(selectedReg.id)}
                          disabled={isProcessing}
                        >
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(selectedReg.id)}
                          disabled={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}

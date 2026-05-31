import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { MapPin, Clock, Phone, X } from 'lucide-react';
import { centerService } from '@/services/centerService';
import type { Center, CenterFilters, VehicleType } from '@/types/types';
import { BookingModal } from '@/components/common/BookingModal';

export default function FindCenters() {
  const location = useLocation();
  const prefilledVehicle = location.state?.prefilledVehicle;
  const prefilledVehicleType = location.state?.prefilledVehicleType;

  const [filters, setFilters] = useState<CenterFilters>({
    vehicleType: prefilledVehicleType as VehicleType | undefined
  });
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      const statesList = await centerService.getStates();
      setStates(statesList);
    };
    loadStates();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (filters.state) {
        const citiesList = await centerService.getCitiesByState(filters.state);
        setCities(citiesList);
      } else {
        setCities([]);
      }
    };
    loadCities();
  }, [filters.state]);

  // Load talukas when city changes
  useEffect(() => {
    const loadTalukas = async () => {
      if (filters.city) {
        const talukasList = await centerService.getTalukasByCity(filters.city);
        setTalukas(talukasList);
      } else {
        setTalukas([]);
      }
    };
    loadTalukas();
  }, [filters.city]);

  // Load filtered centers when filters change
  useEffect(() => {
    const loadCenters = async () => {
      setIsLoading(true);
      const centers = await centerService.getFilteredCenters(filters);
      setFilteredCenters(centers);
      setIsLoading(false);
    };
    loadCenters();
  }, [filters]);

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const paginatedCenters = filteredCenters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: keyof CenterFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Reset dependent filters
      if (key === 'state') {
        delete newFilters.city;
        delete newFilters.taluka;
      }
      if (key === 'city') {
        delete newFilters.taluka;
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const removeFilter = (key: keyof CenterFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleBookNow = (center: Center) => {
    setSelectedCenter(center);
    setIsBookingModalOpen(true);
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Find PUC Centers</h1>

        {/* Filter Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={filters.state || ''}
                  onValueChange={(value) => handleFilterChange('state', value)}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Select
                  value={filters.city || ''}
                  onValueChange={(value) => handleFilterChange('city', value)}
                  disabled={!filters.state}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="taluka">Taluka</Label>
                <Select
                  value={filters.taluka || ''}
                  onValueChange={(value) => handleFilterChange('taluka', value)}
                  disabled={!filters.city}
                >
                  <SelectTrigger id="taluka">
                    <SelectValue placeholder="Select Taluka" />
                  </SelectTrigger>
                  <SelectContent>
                    {talukas.map((taluka) => (
                      <SelectItem key={taluka} value={taluka}>
                        {taluka}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="Enter Pincode"
                  value={filters.pincode || ''}
                  onChange={(e) => handleFilterChange('pincode', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={filters.vehicleType || ''}
                  onValueChange={(value) => handleFilterChange('vehicleType', value as VehicleType)}
                >
                  <SelectTrigger id="vehicleType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2W">2 Wheeler</SelectItem>
                    <SelectItem value="3W">3 Wheeler</SelectItem>
                    <SelectItem value="4W">4 Wheeler</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {key}: {value}
                    <button
                      type="button"
                      onClick={() => removeFilter(key as keyof CenterFilters)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {paginatedCenters.length} of {filteredCenters.length} centers
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-6 w-3/4 bg-muted" />
                  <Skeleton className="mb-2 h-4 w-full bg-muted" />
                  <Skeleton className="mb-2 h-4 w-full bg-muted" />
                  <Skeleton className="mb-4 h-4 w-2/3 bg-muted" />
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedCenters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No centers found. Please adjust your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCenters.map((center) => (
                <Card key={center.id} className="transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-semibold">{center.name}</h3>
                    <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="flex flex-col">
                          <span>{center.address}, {center.city}, {center.state} - {center.pincode}</span>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}, ${center.city}, ${center.state} ${center.pincode}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline mt-1 w-fit"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{center.working_hours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{center.contact}</span>
                      </div>
                    </div>
                    {filters.vehicleType && (
                      <div className="mb-4 rounded-lg bg-primary/10 p-3 text-center">
                        <div className="text-sm text-muted-foreground">Starting from</div>
                        <div className="text-2xl font-bold text-primary">
                          ₹{Math.min(
                            center.pricing[`${filters.vehicleType}_Petrol` as keyof typeof center.pricing],
                            center.pricing[`${filters.vehicleType}_Diesel` as keyof typeof center.pricing] || Infinity
                          )}
                        </div>
                      </div>
                    )}
                    <Button className="w-full" onClick={() => handleBookNow(center)}>
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCenter && (
        <BookingModal
          center={selectedCenter}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedCenter(null);
          }}
          prefilledVehicle={prefilledVehicle}
          prefilledVehicleType={filters.vehicleType || prefilledVehicleType}
        />
      )}
    </PublicLayout>
  );
}

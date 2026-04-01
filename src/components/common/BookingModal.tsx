import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { centerService } from '@/services/centerService';
import { bookingService } from '@/services/bookingService';
import { vehicleService } from '@/services/vehicleService';
import { otpService } from '@/services/otpService';
import type { Center, VehicleType, FuelType, BookingPersonalDetails, BookingVehicleDetails } from '@/types/types';
import { BookingSuccessModal } from './BookingSuccessModal';

interface BookingModalProps {
  center: Center;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ center, isOpen, onClose }: BookingModalProps) {
  const { user, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [personalDetails, setPersonalDetails] = useState<BookingPersonalDetails>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: ''
  });
  const [vehicleDetails, setVehicleDetails] = useState<BookingVehicleDetails>({
    vehicleNumber: '',
    vehicleType: '2W',
    brand: '',
    model: '',
    fuelType: 'Petrol'
  });
  const [otp, setOtp] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const calculatePrice = () => {
    return centerService.calculatePrice(center, vehicleDetails.vehicleType, vehicleDetails.fuelType);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!personalDetails.name || !personalDetails.email || !personalDetails.phone) {
        toast.error('Please fill all fields');
        return;
      }
      if (!isAuthenticated && !personalDetails.password) {
        toast.error('Please enter a password');
        return;
      }
      setStep(2);
    }
  };

  const handleSendOTP = async () => {
    if (!vehicleDetails.vehicleNumber || !vehicleDetails.brand || !vehicleDetails.model) {
      toast.error('Please fill all vehicle details');
      return;
    }

    setIsSendingOTP(true);
    try {
      const result = await otpService.sendOTP({
        email: personalDetails.email,
        purpose: 'booking'
      });

      if (result.success) {
        // For testing: Show OTP in console (REMOVE IN PRODUCTION)
        if (result.data && 'otp' in result.data) {
          console.log('🔐 OTP for testing:', (result.data as any).otp);
          toast.success(`OTP sent! Check console for testing. (OTP: ${(result.data as any).otp})`);
        } else {
          toast.success('OTP sent to your email. Please check your inbox.');
        }
        setOtpSent(true);
        setStep(3);
      } else {
        toast.error(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      // Verify OTP first
      const verifyResult = await otpService.verifyOTP({
        email: personalDetails.email,
        otp: otp,
        purpose: 'booking'
      });

      if (!verifyResult.success) {
        toast.error(verifyResult.message || 'Invalid OTP. Please try again.');
        setIsVerifyingOTP(false);
        return;
      }

      // OTP verified, proceed with booking
      let userId = user?.id;

      // Register user if not authenticated
      if (!isAuthenticated) {
        const success = await register({
          name: personalDetails.name,
          email: personalDetails.email,
          phone: personalDetails.phone,
          password: personalDetails.password,
          role: 'user'
        });

        if (!success) {
          toast.error('Email already exists. Please login.');
          return;
        }

        // Get the newly created user ID
        const { getMockData } = await import('@/data/mockData');
        const data = getMockData();
        const newUser = data.users.find((u) => u.email === personalDetails.email);
        userId = newUser?.id;
      }

      if (!userId) {
        toast.error('Failed to create user');
        return;
      }

      // Add vehicle
      const vehicle = await vehicleService.addVehicle({
        userId,
        number: vehicleDetails.vehicleNumber,
        type: vehicleDetails.vehicleType,
        brand: vehicleDetails.brand,
        model: vehicleDetails.model,
        fuel: vehicleDetails.fuelType
      });

      if (!vehicle) {
        toast.error('Failed to add vehicle');
        return;
      }

      // Create booking
      const price = calculatePrice();

      const booking = await bookingService.createBooking({
        userId,
        centerId: center.id,
        vehicleId: vehicle.id,
        price
      });

      if (!booking) {
        toast.error('Failed to create booking');
        return;
      }

      setBookingData({
        centerName: center.name,
        date: booking.date,
        time: booking.time,
        vehicleNumber: vehicleDetails.vehicleNumber
      });

      setShowSuccessModal(true);
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const result = await otpService.resendOTP({
        email: personalDetails.email,
        purpose: 'booking'
      });

      if (result.success) {
        toast.success('New OTP sent to your email');
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    if (isAuthenticated) {
      navigate('/user/bookings');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Appointment - {center.name}</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="mb-6 flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-1 w-16 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={personalDetails.name}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })}
                  disabled={isAuthenticated}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                  disabled={isAuthenticated}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalDetails.phone}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                  disabled={isAuthenticated}
                />
              </div>
              {!isAuthenticated && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={personalDetails.password}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, password: e.target.value })}
                  />
                </div>
              )}
              <Button className="w-full" onClick={handleNext}>
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  placeholder="MH12AB1234"
                  value={vehicleDetails.vehicleNumber}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={vehicleDetails.vehicleType}
                    onValueChange={(value) => setVehicleDetails({ ...vehicleDetails, vehicleType: value as VehicleType })}
                  >
                    <SelectTrigger id="vehicleType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2W">2 Wheeler</SelectItem>
                      <SelectItem value="3W">3 Wheeler</SelectItem>
                      <SelectItem value="4W">4 Wheeler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={vehicleDetails.fuelType}
                    onValueChange={(value) => setVehicleDetails({ ...vehicleDetails, fuelType: value as FuelType })}
                  >
                    <SelectTrigger id="fuelType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={vehicleDetails.brand}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={vehicleDetails.model}
                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <div className="text-sm text-muted-foreground">Total Price</div>
                <div className="text-3xl font-bold text-primary">₹{calculatePrice()}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  className="w-full" 
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  Enter the 6-digit OTP sent to your email: {personalDetails.email}
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? 'Sending...' : 'Resend OTP'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  className="w-full" 
                  onClick={handleVerifyAndBook}
                  disabled={isVerifyingOTP || otp.length !== 6}
                >
                  {isVerifyingOTP ? 'Verifying...' : 'Verify & Book'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {bookingData && (
        <BookingSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose}
          bookingData={bookingData}
        />
      )}
    </>
  );
}

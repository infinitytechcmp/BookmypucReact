import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, MessageCircle } from 'lucide-react';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    centerName: string;
    date: string;
    time: string;
    vehicleNumber: string;
  };
}

export function BookingSuccessModal({ isOpen, onClose, bookingData }: BookingSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Booking Submitted Successfully!</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success Animation */}
          <div className="flex justify-center">
            <div className="animate-fade-in">
              <CheckCircle2 className="h-20 w-20 text-primary" />
            </div>
          </div>

          {/* Status Message */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm font-medium text-primary">
              ⏳ Pending Shop Owner Confirmation
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Your booking request has been sent to the shop owner. You will be notified once they confirm your appointment.
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Center:</span>
              <span className="text-sm font-medium">{bookingData.centerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tentative Date:</span>
              <span className="text-sm font-medium">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tentative Time:</span>
              <span className="text-sm font-medium">{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vehicle:</span>
              <span className="text-sm font-medium">{bookingData.vehicleNumber}</span>
            </div>
          </div>

          {/* Confirmation Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <Mail className="h-4 w-4" />
              <span>Email notification sent</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp notification sent</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
            <Button className="w-full" onClick={onClose}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

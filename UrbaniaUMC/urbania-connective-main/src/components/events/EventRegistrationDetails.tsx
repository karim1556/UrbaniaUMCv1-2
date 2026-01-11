import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { registrationAPI } from "@/lib/api";
import { toast } from "sonner";

interface EventRegistrationDetailsProps {
  registrationId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationDetails {
  _id: string;
  eventName: string;
  eventDate: string;
  time?: {
    startTime: string;
    endTime: string;
  };
  location: string;
  status: string;
  totalAmount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buildingName?: string;
  wing?: string;
  flatNo?: string;
}

const EventRegistrationDetails: React.FC<EventRegistrationDetailsProps> = ({
  registrationId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<RegistrationDetails | null>(null);

  useEffect(() => {
    if (isOpen && registrationId) {
      fetchRegistrationDetails();
    }
  }, [isOpen, registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true);
      const data = await registrationAPI.getRegistrationDetails(registrationId);
      setRegistration(data);
    } catch (error) {
      toast.error("Failed to fetch registration details");
    } finally {
      setLoading(false);
    }
  };

  if (!registration && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Your registration information for {registration?.eventName}
          </p>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : registration && (
          <div className="space-y-8">
            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(registration.eventDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  {registration.time && (
                    <span className="text-muted-foreground">
                      {registration.time.startTime} - {registration.time.endTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.location}</span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Registration Status</h3>
              <Badge variant="success" className="rounded-full px-4 py-1">
                Completed
              </Badge>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p>{registration.firstName} {registration.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p>{registration.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p>{registration.phone}</p>
                </div>
                {registration.buildingName && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Building</p>
                    <p>{registration.buildingName}</p>
                  </div>
                )}
                {registration.wing && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Wing</p>
                    <p>{registration.wing}</p>
                  </div>
                )}
                {registration.flatNo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Flat No</p>
                    <p>{registration.flatNo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {registration.totalAmount > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div>
                  <span className="text-2xl font-medium">₹{registration.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDetails; 
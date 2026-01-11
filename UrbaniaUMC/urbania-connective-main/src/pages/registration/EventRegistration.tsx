import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button as UIButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import axios from "axios";
import { registrationAPI } from "@/lib/api";
import api from "@/lib/axios";
import { useAuth } from "@/lib/authContext";
import { userAPI } from "@/lib/api";



interface Event {
  _id: string;
  title: string;
  description: string;
  dateTime?: string;
  date?: string;
  time?: {
    startTime?: string;
    endTime?: string;
  };
  location: string;
  ticketTypes?: {
    type: string;
    price: number;
    available: boolean;
  }[];
  capacity?: number;
  registeredCount?: number;
  image?: string;
  organizerName?: string;
  pricing?: {
    type: string;
    amount?: number;
    male?: number;
    female?: number;
    child?: number;
    details?: string;
  };
  images?: string[]; // Added images array
}

// Add PaymentInfo type
interface PaymentInfo {
  method: string;
  status?: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Add FormData type for state
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  eventId: string;
  eventName: string;
  eventDate?: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  ticketPrice: number;
  totalAmount: number;
  paymentInfo: PaymentInfo;
  agreeTerms: boolean;
  buildingName: string;
  wing: string;
  flatNo: string;
  guests?: Guest[];
  
}

// Update FormData type for guests
interface Guest {
  name: string;
  age: string;
}

const steps = [
  "Event & Ticket Selection",
  "Contact Information",
  "Payment & Confirmation"
];

const EventRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [razorpayResponse, setRazorpayResponse] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    // Personal information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    // Event details
    eventId: "",
    eventName: "",
    eventDate: "",
    // Additional information
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    // Payment information
    ticketPrice: 0,
    totalAmount: 0,
    paymentInfo: {
      method: "credit_card",
      razorpay_payment_id: "",
      razorpay_order_id: "",
      razorpay_signature: ""
    },
    // Terms
    agreeTerms: false,
    // New fields
    buildingName: "",
    wing: "",
    flatNo: "",
    guests: [],
  });

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Require login for event registration
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please login to register for an event.'
        },
        replace: true
      });
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events for registration...');
        const response = await api.get("/api/events");
        console.log('Events response:', response.data);

        if (response.data && response.data.events) {
          setEvents(response.data.events);
          console.log('Events loaded:', response.data.events.length);
          console.log('Events data:', response.data.events);
        } else {
          console.warn('No events found in response');
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events. Please try again.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (formData.eventId) {
      const event = events.find(e => e._id === formData.eventId);
      if (event) {
        const perAdultPrice = event.pricing?.amount ?? event.pricing?.male ?? event.pricing?.female ?? 0;
        const childPrice = event.pricing?.child ?? perAdultPrice;

        let total = 0;
        if (formData.guests && formData.guests.length > 0) {
          formData.guests.forEach(guest => {
            const age = parseInt(guest.age);
            if (!isNaN(age)) {
              if (age <= 10) {
                // free
              } else if (age < 18 && event.pricing?.child !== undefined) {
                total += childPrice;
              } else {
                total += perAdultPrice;
              }
            } else {
              // If age not provided or invalid, assume charged as adult
              total += perAdultPrice;
            }
          });
        }

        setFormData(prev => ({
          ...prev,
          ticketPrice: perAdultPrice,
          totalAmount: total
        }));
      }
    }
  }, [formData.eventId, formData.guests, events]);

  useEffect(() => {
    if (selectedEvent && selectedEvent.pricing?.type !== "free") {
      setFormData(prev => ({
        ...prev,
        paymentInfo: { ...prev.paymentInfo, method: "razorpay" }
      }));
    }
    // eslint-disable-next-line
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      if (!selectedEvent.ticketTypes || selectedEvent.ticketTypes.length === 0) {
        if (selectedEvent.pricing?.type === 'free') {
          selectedEvent.ticketTypes = [{ type: 'Free', price: 0, available: true }];
        } else {
          // Use 0 as fallback since Event type does not have a price property
          selectedEvent.ticketTypes = [{ type: 'Paid', price: 0, available: true }];
        }
      }
      // Auto-select first ticket type if not already selected
      // if (!formData.ticketQuantity) {
      //   setFormData(prev => ({ ...prev, ticketQuantity: "1" }));
      // }
    }
    // eslint-disable-next-line
  }, [selectedEvent]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      let firstName = "";
      let lastName = "";
      if (user.name) {
        const nameParts = user.name.trim().split(" ");
        if (nameParts.length === 1) {
          firstName = nameParts[0];
          lastName = "";
        } else {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ") || "";
        }
      }
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName || "",
        lastName: prev.lastName || lastName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || ""
      }));
    }
  }, [authLoading, isAuthenticated, user]);

  // Sync selectedEvent with formData.eventId
  useEffect(() => {
    if (formData.eventId && events.length > 0) {
      const event = events.find(e => e._id === formData.eventId);
      if (event && (!selectedEvent || selectedEvent._id !== event._id)) {
        console.log('Syncing selectedEvent with formData.eventId:', event.title);
        setSelectedEvent(event);
      }
    }
  }, [formData.eventId, events, selectedEvent]);

  // Auto-fill first guest with user name when available
  useEffect(() => {
    if (!(isAuthenticated && user)) return;
    if (formData.guests && formData.guests.length > 0) return; // don't overwrite existing entries

    const effectiveUser = (user as any).isFamilyMember && (user as any).owner ? (user as any).owner : user;

    const selfName = `${effectiveUser.firstName || ''} ${effectiveUser.lastName || ''}`.trim();
    const selfAge = effectiveUser.birthdate ? String(new Date().getFullYear() - new Date(effectiveUser.birthdate).getFullYear()) : '';
    const selfMember: Guest = { name: selfName || (effectiveUser.name || ''), age: selfAge || '' };

    const othersRaw = Array.isArray(effectiveUser.familyMembers) ? effectiveUser.familyMembers : [];
    const others: Guest[] = othersRaw.map((m: any) => ({
      name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '',
      age: m.age ? String(m.age) : (m.birthdate ? String(new Date().getFullYear() - new Date(m.birthdate).getFullYear()) : '')
    }));

    // If others already include self by email/name, prefer others as-is, else prepend self
    const hasSelf = others.some(o => o.name && selfMember.name && o.name.toLowerCase() === selfMember.name.toLowerCase());
    const combined = hasSelf ? others : [selfMember, ...others];

    setFormData(prev => ({ ...prev, guests: combined }));
    // eslint-disable-next-line
  }, [isAuthenticated, user]);

  // Helper function to validate guests
  const validateGuests = () => {
    if (!formData.guests || formData.guests.length === 0) {
      return false; // Must have at least one guest
    }

    // Ensure every guest has both name and age
    const invalidGuests = (formData.guests || []).filter(guest => !guest.name.trim() || !guest.age.trim());
    return invalidGuests.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "eventId") {
      if (typeof value !== "string" || value.startsWith("http")) return;
      console.log('Selecting event with ID:', value);
      const event = events.find(e => e._id === value);
      console.log('Found event:', event);
      if (event) {
        setSelectedEvent(event);

        // Extract event date from various possible fields
        let eventDate = event.dateTime || event.date;
        if (!eventDate && event.time?.startTime) {
          // If we have time but no date, use current date
          eventDate = new Date().toISOString().split('T')[0];
        }

        setFormData(prev => ({
          ...prev,
          eventId: event._id,
          eventName: event.title,
          eventDate: eventDate || ""
        }));
        console.log('Event selected successfully:', event.title);
      } else {
        console.error('Event not found for ID:', value);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleGuestChange = (index: number, field: 'name' | 'age', value: string) => {
    setFormData(prev => {
      const updatedGuests = [...(prev.guests || [])];
      updatedGuests[index] = { ...updatedGuests[index], [field]: value };
      return { ...prev, guests: updatedGuests };
    });
  };

  const handleAddGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...(prev.guests || []), { name: '', age: '' }]
    }));
  };

  const handleRemoveGuest = (index: number) => {
    setFormData(prev => {
      const updated = [...(prev.guests || [])];
      updated.splice(index, 1);
      return { ...prev, guests: updated };
    });
  };

  // Add Razorpay loader
  const waitForRazorpay = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.Razorpay);
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.head.appendChild(script);
      }
    });
  };

  // Helper to sanitize strings for Razorpay
  function sanitizeForRazorpay(str: string) {
    if (!str) return '';
    let sanitized = str.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');   // Remove line breaks
    return sanitized.trim().slice(0, 255);
  }

  const handleRazorpayPayment = async () => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      const paymentRes = await api.post("/api/registrations/event/payment", {
        amount: formData.totalAmount,
        eventId: selectedEvent._id
      });
      await waitForRazorpay();
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentRes.data.order.amount,
        currency: paymentRes.data.order.currency,
        name: sanitizeForRazorpay(selectedEvent.title),
        description: sanitizeForRazorpay(`Registration for ${selectedEvent.title}`),
        order_id: paymentRes.data.order.id,
        handler: (response: any) => {
          setRazorpayResponse(response);
          setPaymentCompleted(true);
          toast.success("Payment successful! Please complete your registration.");
        },
        prefill: {
          name: sanitizeForRazorpay(`${formData.firstName} ${formData.lastName}`),
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: "#4F46E5" }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submission - selectedEvent:', selectedEvent);
    console.log('Form submission - formData:', formData);

    // Validate that an event is selected
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    // Use selectedEvent data as the source of truth
    const eventId = selectedEvent._id;
    const eventName = selectedEvent.title;

    // Extract event date from various possible fields
    let eventDate = selectedEvent.dateTime || selectedEvent.date;
    if (!eventDate && selectedEvent.time?.startTime) {
      // If we have time but no date, use current date
      eventDate = new Date().toISOString().split('T')[0];
    }

    console.log('Using event data:', { eventId, eventName, eventDate });

    // Validate event date
    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate guest information using improved validation
    if (!validateGuests()) {
      toast.error("Please fill in all guest names and ages for participants you've added");
      return;
    }

    // Check if payment is required and completed
    const isFreeEvent = selectedEvent?.pricing?.type === "free" || !selectedEvent?.pricing;
    if (!isFreeEvent && !paymentCompleted) {
      toast.error("Please complete payment before registering.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare registration data
      const generateCustomUserId = () => {
        // Get building code: first two chars of first word + first two chars of second word (if present), uppercase
        let buildingName = formData.buildingName || "";
        let words = buildingName.trim().split(/\s+/);
        let code1 = words[0] ? words[0].substring(0, 2).toUpperCase() : "";
        let code2 = words[1] ? words[1].substring(0, 2).toUpperCase() : "";
        let buildingCode = code1 + code2;
        // Get wing
        let wing = formData.wing || "";
        // Get flat number
        let flatNo = formData.flatNo || "";
        // Get last two digits of phone
        let phone = formData.phone || "";
        let mobileCode = phone.slice(-2);
        return `${buildingCode}/${wing}/${flatNo}/${mobileCode}`;
      };

      const registrationData = {
        ...formData,
        eventId,
        eventName,
        eventDate,
        // Set default values for free events
        ticketPrice: isFreeEvent ? 0 : formData.ticketPrice,
        totalAmount: isFreeEvent ? 0 : formData.totalAmount,
        paymentInfo: isFreeEvent ? {
          method: "free",
          status: "completed",
          razorpay_payment_id: "",
          razorpay_order_id: "",
          razorpay_signature: ""
        } : {
          ...formData.paymentInfo,
          razorpay_payment_id: razorpayResponse?.razorpay_payment_id || "",
          razorpay_order_id: razorpayResponse?.razorpay_order_id || "",
          razorpay_signature: razorpayResponse?.razorpay_signature || ""
        },
        customUserId: generateCustomUserId()
      };

      console.log('Sending registration data:', registrationData);

      const response = await registrationAPI.createEventRegistration(registrationData);

      toast.success("Registration successful!");
      navigate("/registration/success", {
        state: {
          event: selectedEvent,
          registration: {
            ...formData,
            eventId,
            eventName,
            eventDate,
            totalAmount: isFreeEvent ? 0 : formData.totalAmount
          }
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      // Validate step 1 (Event Selection)
      if (!selectedEvent) {
        toast.error("Please select an event");
        return;
      }
    }

    if (currentStep === 1) {
      // Validate step 2 (Contact Information)
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error("Please fill all required fields");
        return;
      }

      // Validate building information
      if (!formData.buildingName || !formData.wing || !formData.flatNo) {
        toast.error("Please fill in building name, wing, and flat number");
        return;
      }

      // Validate that at least one participant (family member) is added
      const totalParticipants = formData.guests ? formData.guests.length : 0;
      if (totalParticipants === 0) {
        toast.error("Please add at least one family member");
        return;
      }

      // Validate guest information using improved validation
      if (!validateGuests()) {
        toast.error("Please fill in all guest names and ages for participants you've added");
        return;
      }
    }

    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // Guest add/remove handlers will be defined below

  useEffect(() => {
    // Autofill Step 2 fields from user profile when on Step 2
    if (isAuthenticated && currentStep === 1) {
      userAPI.getProfile().then(res => {
        const user = res.data;
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || prev.firstName || "",
          lastName: user.lastName || prev.lastName || "",
          email: user.email || prev.email || "",
          phone: user.phone || user.mobile || prev.phone || "",
          address: user.address || prev.address || ""
        }));
      });
    }
  }, [isAuthenticated, currentStep]);

  useEffect(() => {
    // If eventId is provided via params or location.state, set it in formData and skip event selection
    let eventId = params.eventId || location.state?.eventId || location.state?.event?._id;
    if (eventId && events.length > 0) {
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setFormData(prev => ({
          ...prev,
          eventId: event._id,
          eventName: event.title,
          eventDate: event.dateTime || event.date || ""
        }));
        setCurrentStep(1); // Skip event selection step
      }
    }
  }, [params.eventId, location.state, events]);

  return (
    <MainLayout>
      <div className="container mx-auto pt-24 pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Event Registration</h1>
          <p className="text-muted-foreground mb-6">
            Register for community events and activities.
          </p>

          <Separator className="my-6" />

          {/* Stepper UI */}
          <div className="flex items-center mb-8">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${idx === currentStep
                  ? "bg-primary"
                  : idx < currentStep
                    ? "bg-green-500"
                    : "bg-gray-300"
                  }`}>{idx + 1}</div>
                <span className="ml-2 mr-4 font-medium text-sm">
                  {step}
                </span>
                {idx < steps.length - 1 && (
                  <span className="w-8 h-1 bg-gray-300 rounded-full mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Main content conditional rendering with single parent */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Events Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no events available for registration.
                </p>
                <UIButton onClick={() => navigate("/events")}>View All Events</UIButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Event & Ticket Selection */}
              {currentStep === 0 && !formData.eventId && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Selection</CardTitle>
                      <CardDescription>
                        Choose an event you would like to attend.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventId">Select Event <span className="text-red-500">*</span></Label>
                        <Select
                          value={formData.eventId}
                          onValueChange={(value) => handleSelectChange("eventId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                          <SelectContent>
                            {events.map(event => {
                              const eventDate = event.dateTime || event.date;
                              const isValidDate = eventDate && !isNaN(Date.parse(eventDate));
                              return (
                                <SelectItem key={event._id} value={event._id}>
                                  {event.title} {isValidDate && eventDate ? `- ${new Date(eventDate).toLocaleDateString()}` : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {selectedEvent && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Event selected: {selectedEvent.title}
                          </div>
                        )}
                      </div>

                      {selectedEvent && (
                        <div className="flex flex-col items-center mb-6">
                          <img
                            src={(Array.isArray(selectedEvent.images) && selectedEvent.images.length > 0) ? selectedEvent.images[0] : (selectedEvent.image || "/default-event.png")}
                            alt={selectedEvent.title}
                            className="w-40 h-40 object-cover rounded-full border mb-2"
                            style={{ background: '#f3f4f6' }}
                          />
                          <h2 className="text-2xl font-bold mt-2 mb-1">{selectedEvent.title}</h2>
                          {selectedEvent.organizerName && (
                            <div className="text-muted-foreground text-sm mb-1">Organized by {selectedEvent.organizerName}</div>
                          )}
                          <div className="text-muted-foreground text-sm mb-1">{selectedEvent.location}</div>
                          <div className="text-muted-foreground text-sm mb-1">
                            {(() => {
                              const eventDate = selectedEvent.dateTime || selectedEvent.date;
                              return eventDate ? new Date(eventDate).toLocaleDateString() : "";
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <UIButton type="button" onClick={nextStep}>
                        Next
                      </UIButton>
                    </CardFooter>
                  </Card>
                </>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 1 && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        Please provide your contact details for the event registration.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Family Members <span className="text-red-500">*</span></Label>
                          <UIButton type="button" onClick={handleAddGuest}>Add Family Member</UIButton>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Please fill in the details for each family member who will attend.
                        </div>
                        {formData.guests && formData.guests.length > 0 ? (
                          <div className="space-y-3">
                            {formData.guests.map((guest, idx) => {
                              const hasData = guest.name.trim() || guest.age.trim();
                              const isComplete = guest.name.trim() && guest.age.trim();
                              return (
                                <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border ${hasData && !isComplete ? 'border-orange-200 bg-orange-50' :
                                  isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                  }`}>
                                  <div className="col-span-5">
                                    <Input
                                      placeholder="Full Name"
                                      value={guest.name}
                                      onChange={e => handleGuestChange(idx, 'name', e.target.value)}
                                      className={hasData && !guest.name.trim() ? 'border-orange-300' : ''}
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <Input
                                      placeholder="Age"
                                      type="number"
                                      min="0"
                                      max="120"
                                      value={guest.age}
                                      onChange={e => handleGuestChange(idx, 'age', e.target.value)}
                                      className={hasData && !guest.age.trim() ? 'border-orange-300' : ''}
                                    />
                                  </div>
                                  <div className="col-span-4 flex justify-end">
                                    <UIButton type="button" variant="outline" size="sm" onClick={() => handleRemoveGuest(idx)}>Remove</UIButton>
                                  </div>
                                  {hasData && !isComplete && (
                                    <div className="col-span-12 mt-1">
                                      <span className="text-xs text-orange-600">
                                        Please complete both name and age for this participant
                                      </span>
                                    </div>
                                  )}
                                  {isComplete && (
                                    <div className="col-span-12 mt-1">
                                      <span className="text-xs text-green-600">
                                        ✓ Participant details complete
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm p-4 border border-dashed border-gray-300 rounded-lg text-center">
                            Add at least one family member using the button above.
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildingName">Building Name <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.buildingName || ""}
                            onValueChange={value => handleSelectChange("buildingName", value)}
                            required
                          >
                            <SelectTrigger id="buildingName">
                              <SelectValue placeholder="Choose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rustomjee Azziano">Rustomjee Azziano</SelectItem>
                              <SelectItem value="Rustomjee Aurelia">Rustomjee Aurelia</SelectItem>
                              <SelectItem value="Rustomjee Accura">Rustomjee Accura</SelectItem>
                              <SelectItem value="Rustomjee Atelier">Rustomjee Atelier</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wing">Wing <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.wing || ""}
                            onValueChange={value => handleSelectChange("wing", value)}
                            required
                          >
                            <SelectTrigger id="wing">
                              <SelectValue placeholder="Select Wing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A Wing</SelectItem>
                              <SelectItem value="B">B Wing</SelectItem>
                              <SelectItem value="C">C Wing</SelectItem>
                              <SelectItem value="D">D Wing</SelectItem>
                              <SelectItem value="E">E Wing</SelectItem>
                              <SelectItem value="F">F Wing</SelectItem>
                              <SelectItem value="G">G Wing</SelectItem>
                              <SelectItem value="H">H Wing</SelectItem>
                              <SelectItem value="I">I Wing</SelectItem>
                              <SelectItem value="J">J Wing</SelectItem>
                              <SelectItem value="K">K Wing</SelectItem>
                              <SelectItem value="L">L Wing</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flatNo">Flat No <span className="text-red-500">*</span></Label>
                          <Input
                            id="flatNo"
                            name="flatNo"
                            value={formData.flatNo || ""}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <UIButton type="button" variant="outline" onClick={prevStep}>
                        Back
                      </UIButton>
                      <UIButton type="button" onClick={nextStep}>
                        Next
                      </UIButton>
                    </CardFooter>
                  </Card>
                </>
              )}

              {/* Step 3: Payment & Confirmation */}
              {currentStep === 2 && selectedEvent && selectedEvent.pricing?.type === "free" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Confirmation</CardTitle>
                    <CardDescription>
                      This event is free. Review your registration details and click Register to complete your registration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Essential Registration Summary for Free Events */}
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Registration Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Event</span>
                          <span>{selectedEvent.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span>{(() => { const eventDate = selectedEvent.dateTime || selectedEvent.date; return eventDate ? new Date(eventDate).toLocaleDateString() : ""; })()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location</span>
                          <span>{selectedEvent.location}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                          <span>Total Attendees</span>
                          <span>{formData.guests ? formData.guests.length : 0}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                          <span>Total</span>
                          <span>₹0</span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded p-4 bg-muted">
                      <h3 className="font-medium mb-2">Terms and Conditions</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>You agree to provide accurate information for event registration.</li>
                        <li>You will follow all event rules and instructions provided by the organizers.</li>
                        <li>Urbania Connective is not responsible for any personal belongings lost during the event.</li>
                        <li>Photos or videos may be taken during the event for promotional purposes.</li>
                        <li>Your registration data will be handled according to our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.</li>
                      </ul>
                      <div className="flex items-center mt-3">
                        <Checkbox
                          id="agreeTermsFree"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleCheckboxChange("agreeTerms", checked as boolean)}
                        />
                        <Label htmlFor="agreeTermsFree" className="ml-2 text-sm">
                          I agree to the Terms and Conditions <span className="text-red-500">*</span>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <UIButton type="button" variant="outline" onClick={prevStep}>
                      Back
                    </UIButton>
                    <UIButton type="submit" className="w-full" disabled={isSubmitting || !formData.agreeTerms}>
                      Register for Event
                    </UIButton>
                  </CardFooter>
                </Card>
              )}
              {currentStep === 2 && selectedEvent && selectedEvent.pricing?.type !== "free" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                      <CardDescription>
                        Pay securely using Razorpay.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentInfo.method">Payment Method</Label>
                        <Select
                          value={formData.paymentInfo.method}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            paymentInfo: { ...prev.paymentInfo, method: value }
                          }))}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue>{formData.paymentInfo.method === "razorpay" ? "Razorpay" : ""}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="razorpay">Razorpay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-muted p-4 rounded-lg mt-4">
                        <h3 className="font-medium mb-2">Order Summary</h3>
                        <div className="space-y-1 text-sm">
                          {(formData.guests || []).map((g, i) => {
                            const age = parseInt(g.age);
                            const perAdultPrice = (selectedEvent?.pricing?.amount ?? selectedEvent?.pricing?.male ?? selectedEvent?.pricing?.female ?? 0);
                            const childPrice = selectedEvent?.pricing?.child ?? perAdultPrice;
                            let price = 0;
                            if (!isNaN(age)) {
                              if (age <= 10) price = 0;
                              else if (age < 18 && selectedEvent?.pricing?.child !== undefined) price = childPrice;
                              else price = perAdultPrice;
                            } else {
                              price = perAdultPrice;
                            }
                            return (
                              <div key={i} className="flex justify-between">
                                <span>{g.name || `Participant ${i + 1}`} ({g.age || 'N/A'})</span>
                                <span>₹{price.toFixed(2)}</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between">
                            <span>Total Attendees</span>
                            <span>{formData.guests ? formData.guests.length : 0}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                            <span>Total</span>
                            <span>₹{formData.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      {!paymentCompleted && (
                        <UIButton type="button" className="w-full mt-4" onClick={handleRazorpayPayment} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing Payment...</>
                          ) : (
                            <>Pay Now</>
                          )}
                        </UIButton>
                      )}
                      {paymentCompleted && (
                        <div className="w-full mt-4 p-3 bg-green-100 text-green-800 rounded text-center font-medium">
                          Payment successful! You can now complete your registration.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Terms and Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-2 pt-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleCheckboxChange("agreeTerms", checked as boolean)}
                        />
                        <Label htmlFor="agreeTerms" className="leading-normal">
                          I agree to the <a href="#" className="text-primary hover:underline">terms and conditions</a> and <a href="#" className="text-primary hover:underline">privacy policy</a>. <span className="text-red-500">*</span>
                        </Label>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <UIButton type="button" variant="outline" onClick={prevStep}>
                        Back
                      </UIButton>
                      <UIButton type="submit" className="w-full" disabled={isSubmitting || !paymentCompleted}>
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                        ) : (
                          <>
                            Register Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </UIButton>
                    </CardFooter>
                  </Card>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EventRegistration;
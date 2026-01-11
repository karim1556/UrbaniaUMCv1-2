import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User, Users, UserPlus, IdCard, FileText, Heart, ArrowRight, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";

const registrationTypes = [
  {
    id: "membership",
    title: "Community Membership",
    description: "Join as a member of our community center.",
    icon: User,
    color: "bg-blue-50 text-blue-700",
    price: "₹50 per year",
    benefits: [
      "Access to all community events",
      "Discounted rates for facility rentals",
      "Monthly newsletter subscription",
      "Voting rights at annual general meetings",
      "Priority registration for popular programs"
    ]
  },
  {
    id: "family",
    title: "Family Membership",
    description: "Register your entire family for community membership.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700",
    price: "₹80 per year",
    benefits: [
      "All benefits of individual membership",
      "Coverage for up to 6 family members",
      "Additional discounts on children's programs",
      "Family events access and participation",
      "Discounted community center services"
    ]
  },
  {
    id: "event",
    title: "Event Registration",
    description: "Register for a specific community event.",
    icon: Calendar,
    color: "bg-amber-50 text-amber-700",
    price: "₹20 per person",
    benefits: [
      "Reserved seating at the event",
      "Event materials and resources",
      "Participation certificate if applicable",
      "Networking opportunities",
      "Follow-up resources after the event"
    ]
  },
  {
    id: "program",
    title: "Program Enrollment",
    description: "Enroll in educational or community programs.",
    icon: FileText,
    color: "bg-purple-50 text-purple-700",
    price: "₹60 per month",
    benefits: [
      "Structured learning environment",
      "Expert instruction and guidance",
      "Program materials and resources",
      "Certificate of completion",
      "Community of fellow participants"
    ]
  },
  {
    id: "volunteer",
    title: "Volunteer Registration",
    description: "Register as a volunteer for community service.",
    icon: Heart,
    color: "bg-red-50 text-red-700",
    price: "Free",
    benefits: [
      "Opportunity to serve the community",
      "Skill development and experience",
      "Community service hours documentation",
      "Volunteer appreciation events",
      "Reference letters for dedicated volunteers"
    ]
  },
  {
    id: "service-request",
    title: "Service Request",
    description: "Register to request a specific community service.",
    icon: IdCard,
    color: "bg-indigo-50 text-indigo-700",
    price: "Varies by service",
    benefits: [
      "Access to essential community services",
      "Personalized assistance",
      "Follow-up support as needed",
      "Referrals to additional resources",
      "Confidential and respectful service"
    ]
  }
];

const events = [
  {
    id: "eid-celebration",
    title: "Eid Celebration",
    date: "July 15, 2023",
    price: "₹20 per person",
    location: "Main Hall"
  },
  {
    id: "community-bbq",
    title: "Summer Community BBQ",
    date: "August 5, 2023",
    price: "₹15 per person",
    location: "Outdoor Garden"
  },
  {
    id: "health-fair",
    title: "Community Health Fair",
    date: "September 10, 2023",
    price: "Free",
    location: "Community Center"
  }
];

const programs = [
  {
    id: "quran-class",
    title: "Quran Memorization Class",
    schedule: "Saturdays, 10:00 AM - 12:00 PM",
    price: "₹60 per month",
    instructor: "Shaykh Mohammad"
  },
  {
    id: "arabic-beginners",
    title: "Arabic for Beginners",
    schedule: "Tuesdays & Thursdays, 6:00 PM - 7:30 PM",
    price: "₹50 per month",
    instructor: "Professor Layla"
  },
  {
    id: "youth-leadership",
    title: "Youth Leadership Program",
    schedule: "Fridays, 5:00 PM - 7:00 PM",
    price: "₹45 per month",
    instructor: "Brother Yousef"
  }
];

const RegistrationTypeCard = ({ 
  type,
  isActive, 
  onClick 
}: { 
  type: typeof registrationTypes[0];
  isActive: boolean; 
  onClick: () => void;
}) => {
  const Icon = type.icon;
  
  return (
    <div 
      className={cn(
        "relative p-6 rounded-xl transition-all duration-300 cursor-pointer border group",
        isActive 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
        type.color
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium mb-2">{type.title}</h3>
      <p className="text-muted-foreground text-sm">{type.description}</p>
      <div className="mt-4 text-sm font-medium text-primary">
        {type.price}
      </div>
    </div>
  );
};

const Registration = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [activeType, setActiveType] = useState(registrationTypes[0].id);
  const [activeTab, setActiveTab] = useState("type");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    eventOrProgram: "",
    participants: "1",
    specialRequests: "",
    agreeTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const selectedType = registrationTypes.find(type => type.id === activeType) || registrationTypes[0];

  // Require login for registration
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please login to register.'
        },
        replace: true
      });
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Registration completed successfully!", {
        description: "You'll receive a confirmation email shortly."
      });
      
      // Reset form and navigate to confirmation
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        eventOrProgram: "",
        participants: "1",
        specialRequests: "",
        agreeTerms: false
      });
      setIsSubmitting(false);
      
      // Navigate to home page after successful submission
      navigate("/");
    }, 1500);
  };

  const handleNextStep = () => {
    if (activeTab === "type") {
      setActiveTab("details");
    } else if (activeTab === "details") {
      setActiveTab("review");
    }
  };

  const handlePrevStep = () => {
    if (activeTab === "details") {
      setActiveTab("type");
    } else if (activeTab === "review") {
      setActiveTab("details");
    }
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Registration
            </h1>
            <p className="text-lg text-muted-foreground">
              Register for membership, programs, events, or services. Complete the steps below to join our community.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center w-full">
              <div className={`flex flex-col items-center ${activeTab === "type" ? "text-primary" : activeTab === "details" || activeTab === "review" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "type" || activeTab === "details" || activeTab === "review" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  1
                </div>
                <span className="mt-2 text-sm">Type</span>
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${activeTab === "details" || activeTab === "review" ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`flex flex-col items-center ${activeTab === "details" || activeTab === "review" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "details" || activeTab === "review" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  2
                </div>
                <span className="mt-2 text-sm">Details</span>
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${activeTab === "review" ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`flex flex-col items-center ${activeTab === "review" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "review" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  3
                </div>
                <span className="mt-2 text-sm">Review</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="type" className="p-0 m-0">
                <div className="p-6">
                  <h2 className="text-2xl font-display font-medium mb-6">
                    Select Registration Type
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {registrationTypes.map((type) => (
                      <RegistrationTypeCard 
                        key={type.id}
                        type={type}
                        isActive={activeType === type.id}
                        onClick={() => setActiveType(type.id)}
                      />
                    ))}
                  </div>
                  
                  <div className="bg-primary/5 p-6 rounded-xl">
                    <h3 className="text-lg font-medium mb-4">
                      {selectedType.title}: Benefits
                    </h3>
                    <ul className="space-y-2">
                      {selectedType.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button onClick={handleNextStep}>
                      Continue to Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="p-0 m-0">
                <div className="p-6">
                  <h2 className="text-2xl font-display font-medium mb-6">
                    Personal Information
                  </h2>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          placeholder="Enter your first name" 
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          placeholder="Enter your last name" 
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="Enter your phone number" 
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        placeholder="Enter your address" 
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          name="city" 
                          placeholder="Enter your city" 
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          placeholder="State" 
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input 
                          id="zip" 
                          name="zip" 
                          placeholder="ZIP" 
                          value={formData.zip}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    {(activeType === "event" || activeType === "program") && (
                      <div>
                        <Label htmlFor="eventOrProgram">
                          {activeType === "event" ? "Select Event" : "Select Program"}
                        </Label>
                        <Select 
                          value={formData.eventOrProgram} 
                          onValueChange={(value) => handleSelectChange('eventOrProgram', value)}
                        >
                          <SelectTrigger id="eventOrProgram">
                            <SelectValue placeholder={activeType === "event" ? "Select an event" : "Select a program"} />
                          </SelectTrigger>
                          <SelectContent>
                            {activeType === "event" 
                              ? events.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.title} - {event.date}
                                </SelectItem>
                              ))
                              : programs.map((program) => (
                                <SelectItem key={program.id} value={program.id}>
                                  {program.title} - {program.schedule}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {(activeType === "membership" || activeType === "family" || activeType === "event") && (
                      <div>
                        <Label htmlFor="participants">Number of Participants</Label>
                        <Select 
                          value={formData.participants} 
                          onValueChange={(value) => handleSelectChange('participants', value)}
                        >
                          <SelectTrigger id="participants">
                            <SelectValue placeholder="Select number of participants" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Person</SelectItem>
                            <SelectItem value="2">2 People</SelectItem>
                            <SelectItem value="3">3 People</SelectItem>
                            <SelectItem value="4">4 People</SelectItem>
                            <SelectItem value="5">5 People</SelectItem>
                            <SelectItem value="6">6+ People</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="specialRequests">Special Requests or Comments</Label>
                      <Textarea 
                        id="specialRequests" 
                        name="specialRequests" 
                        placeholder="Enter any special requests or additional information" 
                        rows={3}
                        value={formData.specialRequests}
                        onChange={handleChange}
                      />
                    </div>
                  </form>
                  
                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button onClick={handleNextStep}>
                      Continue to Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="review" className="p-0 m-0">
                <div className="p-6">
                  <h2 className="text-2xl font-display font-medium mb-6">
                    Review & Submit
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Registration Type</h3>
                      <p>{selectedType.title} - {selectedType.price}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Personal Information</h3>
                        <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                          <p><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
                          <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                          <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Address</h3>
                        <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                          <p>{formData.address}</p>
                          <p>{formData.city}, {formData.state} {formData.zip}</p>
                        </div>
                      </div>
                    </div>
                    
                    {(activeType === "event" || activeType === "program") && formData.eventOrProgram && (
                      <div>
                        <h3 className="font-medium mb-2">
                          {activeType === "event" ? "Selected Event" : "Selected Program"}
                        </h3>
                        <div className="bg-accent/50 p-4 rounded-lg">
                          {activeType === "event" 
                            ? events.find(event => event.id === formData.eventOrProgram)?.title
                            : programs.find(program => program.id === formData.eventOrProgram)?.title
                          }
                        </div>
                      </div>
                    )}
                    
                    {(activeType === "membership" || activeType === "family" || activeType === "event") && (
                      <div>
                        <h3 className="font-medium mb-2">Number of Participants</h3>
                        <div className="bg-accent/50 p-4 rounded-lg">
                          {formData.participants} {parseInt(formData.participants) === 1 ? "Person" : "People"}
                        </div>
                      </div>
                    )}
                    
                    {formData.specialRequests && (
                      <div>
                        <h3 className="font-medium mb-2">Special Requests</h3>
                        <div className="bg-accent/50 p-4 rounded-lg">
                          {formData.specialRequests}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="agreeTerms" 
                          checked={formData.agreeTerms}
                          onCheckedChange={handleCheckboxChange}
                          required
                        />
                        <label
                          htmlFor="agreeTerms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!formData.agreeTerms || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Need Assistance?</h2>
            <p className="text-muted-foreground mb-8">
              If you need help with the registration process or have questions about our membership options,
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+15551234567">Call (555) 123-4567</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Registration;

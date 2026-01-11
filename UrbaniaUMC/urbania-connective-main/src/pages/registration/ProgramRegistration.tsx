import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import axios from "axios";
import { registrationAPI } from "@/lib/api";
import api from "@/lib/axios";

interface Program {
  _id: string;
  title: string;
  description: string;
  category: string;
  enrollment: {
    registrationFee: number;
    maxParticipants: number;
    currentEnrollment: number;
  };
  sessions: {
    day: string;
    time: string;
  }[];
}

const ProgramRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Personal information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Program details
    programId: "",
    programName: "",
    sessionPreference: "",
    
    // Participant details
    participantAge: "",
    participantGender: "",
    numberOfParticipants: "1",
    additionalParticipants: [],
    
    // Emergency contact
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    
    // Medical information
    medicalInformation: "",
    
    // Payment information
    paymentInfo: {
      method: "credit_card",
    },
    
    // Scholarship
    scholarshipRequested: false,
    scholarshipDetails: "",
    
    // Special requests
    specialRequests: "",
    
    // Terms
    agreeTerms: false
  });
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get("/api/programs");
        setPrograms(response.data.programs);
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast.error("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested emergency contact fields
    if (name.startsWith("emergency.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev, 
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === "programId") {
      const selectedProgram = programs.find(p => p._id === value);
      if (selectedProgram) {
        setFormData(prev => ({ 
          ...prev, 
          programId: value,
          programName: selectedProgram.title,
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    if (!formData.programId || !formData.sessionPreference) {
      toast.error("Please select a program and session preference");
      return;
    }
    
    if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
      toast.error("Please provide emergency contact information");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting program registration form:", formData);
      
      // Prepare data for API
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        programId: formData.programId,
        programName: formData.programName,
        sessionPreference: formData.sessionPreference,
        participantAge: formData.participantAge,
        participantGender: formData.participantGender,
        numberOfParticipants: formData.numberOfParticipants,
        additionalParticipants: formData.additionalParticipants,
        emergencyContact: formData.emergencyContact,
        medicalInformation: formData.medicalInformation,
        paymentInfo: formData.paymentInfo,
        scholarshipRequested: formData.scholarshipRequested,
        scholarshipDetails: formData.scholarshipDetails,
        specialRequests: formData.specialRequests,
        agreeTerms: formData.agreeTerms
      };
      
      // First try using the direct API endpoint
      let response;
      try {
        console.log("Trying direct API call...");
        response = await api.post('/api/registrations/program', apiData);
      } catch (err) {
        console.error("Direct API call failed, trying registrationAPI service...", err);
        response = await registrationAPI.createProgramRegistration(apiData);
      }
      
      console.log("Registration response:", response?.data);
      
      toast.success("Program registration completed successfully!", {
        description: "You'll receive a confirmation email shortly."
      });
      
      // Navigate to confirmation or dashboard
      navigate("/dashboard", { state: { registration: response.data.registration } });
    } catch (error) {
      console.error("Program registration error:", error);
      toast.error("Registration failed", { 
        description: "There was an error processing your registration. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Program Registration</h1>
          <p className="text-muted-foreground mb-6">
            Enroll in our educational and community programs to advance your skills and knowledge.
          </p>
          
          <Separator className="my-6" />
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading programs...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Program Selection</CardTitle>
                  <CardDescription>
                    Choose a program you would like to participate in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="programId">Select Program <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.programId} 
                      onValueChange={(value) => handleSelectChange("programId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(program => (
                          <SelectItem key={program._id} value={program._id}>
                            {program.title} (₹{program.enrollment.registrationFee})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.programId && (
                    <div className="space-y-2">
                      <Label htmlFor="sessionPreference">Session Preference <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.sessionPreference} 
                        onValueChange={(value) => handleSelectChange("sessionPreference", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning Sessions</SelectItem>
                          <SelectItem value="afternoon">Afternoon Sessions</SelectItem>
                          <SelectItem value="evening">Evening Sessions</SelectItem>
                          <SelectItem value="weekend">Weekend Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Please provide your contact details for the program registration.
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
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Participant Information</CardTitle>
                  <CardDescription>
                    Please provide details about the program participant(s).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="participantAge">Age</Label>
                      <Input
                        id="participantAge"
                        name="participantAge"
                        type="number"
                        value={formData.participantAge}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="participantGender">Gender</Label>
                      <Select 
                        value={formData.participantGender} 
                        onValueChange={(value) => handleSelectChange("participantGender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numberOfParticipants">Number of Participants</Label>
                    <Select 
                      value={formData.numberOfParticipants} 
                      onValueChange={(value) => handleSelectChange("numberOfParticipants", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency.name">Emergency Contact Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="emergency.name"
                      name="emergency.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency.phone">Emergency Contact Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="emergency.phone"
                        name="emergency.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency.relationship">Relationship</Label>
                      <Input
                        id="emergency.relationship"
                        name="emergency.relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medicalInformation">Medical Information or Special Needs</Label>
                    <Textarea
                      id="medicalInformation"
                      name="medicalInformation"
                      value={formData.medicalInformation}
                      onChange={handleChange}
                      placeholder="Please share any medical information or special needs that we should be aware of"
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment and Scholarship</CardTitle>
                  <CardDescription>
                    Select your payment method and scholarship options.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select 
                      value={formData.paymentInfo.method} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        paymentInfo: { ...prev.paymentInfo, method: value } 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cash">Cash (Pay in person)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox 
                      id="scholarshipRequested" 
                      checked={formData.scholarshipRequested}
                      onCheckedChange={(checked) => handleCheckboxChange("scholarshipRequested", checked as boolean)}
                    />
                    <Label htmlFor="scholarshipRequested" className="leading-normal">
                      I would like to apply for a scholarship or financial assistance
                    </Label>
                  </div>
                  
                  {formData.scholarshipRequested && (
                    <div className="space-y-2">
                      <Label htmlFor="scholarshipDetails">Scholarship Details</Label>
                      <Textarea
                        id="scholarshipDetails"
                        name="scholarshipDetails"
                        value={formData.scholarshipDetails}
                        onChange={handleChange}
                        placeholder="Please provide details about your scholarship request"
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests or Comments</Label>
                    <Textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Please share any special requests or additional information"
                      className="min-h-[100px]"
                    />
                  </div>
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
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProgramRegistration; 
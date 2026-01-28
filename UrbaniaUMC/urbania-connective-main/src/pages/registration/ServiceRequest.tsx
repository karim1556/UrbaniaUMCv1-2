import React, { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowRight, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { registrationAPI } from "@/lib/api";
import api from "@/lib/axios";

// Service types available
const serviceTypes = [
  { id: "food_assistance", name: "Food Assistance" },
  { id: "housing_support", name: "Housing Support" },
  { id: "employment_services", name: "Employment Services" },
  { id: "educational_support", name: "Educational Support" },
  { id: "legal_assistance", name: "Legal Assistance" },
  { id: "health_services", name: "Health Services" },
  { id: "elderly_care", name: "Elderly Care" },
  { id: "youth_services", name: "Youth Services" },
  { id: "counseling", name: "Counseling Services" },
  { id: "translation", name: "Translation Services" },
  { id: "other", name: "Other Services" }
];

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
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
    
    // Service details
    serviceType: "",
    requestTitle: "",
    description: "",
    urgency: "medium", // low, medium, high, emergency
    
    // Service scheduling
    preferredDate: "",
    preferredTime: "",
    recurring: false,
    recurringFrequency: "",
    
    // Household members
    householdMembers: [] as { name: string; relationship: string; age: string }[],
    
    // Income and eligibility
    incomeVerification: {
      hasIncome: false,
      incomeSource: "",
      eligibleForAssistance: false
    },
    
    // Referral information
    referredBy: "",
    
    // Special requests
    specialRequests: "",
    
    // Terms
    agreeTerms: false,
    agreeToFollowUp: true
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev as any)[parent] as any),
          [child]: checked
        }
      } as any));
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, preferredDate: selectedDate.toISOString() }));
    }
  };
  
  const addHouseholdMember = () => {
    setFormData(prev => ({
      ...prev,
      householdMembers: [
        ...prev.householdMembers,
        { name: "", relationship: "", age: "" }
      ]
    }));
  };
  
  const removeHouseholdMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      householdMembers: prev.householdMembers.filter((_, i) => i !== index)
    }));
  };
  
  const handleHouseholdMemberChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedMembers = [...prev.householdMembers];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, householdMembers: updatedMembers };
    });
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
    
    if (!formData.serviceType || !formData.requestTitle || !formData.description) {
      toast.error("Please provide service details");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting service request form:", formData);
      
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
        serviceType: formData.serviceType,
        requestTitle: formData.requestTitle,
        description: formData.description,
        urgency: formData.urgency,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        recurring: formData.recurring,
        recurringFrequency: formData.recurringFrequency,
        householdMembers: formData.householdMembers,
        incomeVerification: formData.incomeVerification,
        referredBy: formData.referredBy,
        specialRequests: formData.specialRequests,
        agreeTerms: formData.agreeTerms,
        agreeToFollowUp: formData.agreeToFollowUp
      };
      
      // First try using the direct API endpoint
      let response;
      try {
        console.log("Trying direct API call...");
        response = await api.post('/api/registrations/service', apiData);
      } catch (err) {
        console.error("Direct API call failed, trying registrationAPI service...", err);
        response = await registrationAPI.createServiceRequest(apiData);
      }
      
      console.log("Registration response:", response?.data);
      
      toast.success("Service request submitted successfully!", {
        description: "We'll review your request and get back to you soon."
      });
      
      // Navigate to confirmation or dashboard
      navigate("/dashboard", { state: { serviceRequest: response.data.serviceRequest } });
    } catch (error) {
      console.error("Service request error:", error);
      toast.error("Request submission failed", { 
        description: "There was an error processing your request. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Service Request</h1>
          <p className="text-muted-foreground mb-6">
            Request assistance and support services from our community center.
          </p>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your contact details so we can assist you.
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
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Tell us about the service you're requesting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.serviceType} 
                    onValueChange={(value) => handleSelectChange("serviceType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestTitle">Request Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="requestTitle"
                    name="requestTitle"
                    value={formData.requestTitle}
                    onChange={handleChange}
                    placeholder="Brief title for your request"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe the service you're requesting in detail"
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <HelpCircle className="h-3.5 w-3.5 mr-1" />
                      <span>How urgent is your request?</span>
                    </div>
                  </div>
                  <RadioGroup
                    value={formData.urgency}
                    onValueChange={(value) => handleRadioChange("urgency", value)}
                    className="grid grid-cols-4 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="urgency-low" />
                      <Label htmlFor="urgency-low" className="text-sm">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="urgency-medium" />
                      <Label htmlFor="urgency-medium" className="text-sm">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="urgency-high" />
                      <Label htmlFor="urgency-high" className="text-sm">High</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emergency" id="urgency-emergency" />
                      <Label htmlFor="urgency-emergency" className="text-sm">Emergency</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Service Scheduling</CardTitle>
                <CardDescription>
                  Choose your preferred timing for the service.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(date) => {
                          // Disable dates in the past
                          return date < new Date(new Date().setHours(0, 0, 0, 0));
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Select 
                    value={formData.preferredTime} 
                    onValueChange={(value) => handleSelectChange("preferredTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12pm - 4pm)</SelectItem>
                      <SelectItem value="evening">Evening (4pm - 7pm)</SelectItem>
                      <SelectItem value="any">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="recurring" 
                    checked={formData.recurring}
                    onCheckedChange={(checked) => handleCheckboxChange("recurring", checked as boolean)}
                  />
                  <Label htmlFor="recurring" className="leading-normal">
                    This is a recurring service request
                  </Label>
                </div>
                
                {formData.recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurringFrequency">Frequency</Label>
                    <Select 
                      value={formData.recurringFrequency} 
                      onValueChange={(value) => handleSelectChange("recurringFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Household Information</CardTitle>
                <CardDescription>
                  Please provide information about your household members, if applicable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {formData.householdMembers.map((member, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`member-${index}-name`} className="text-xs">Name</Label>
                          <Input
                            id={`member-${index}-name`}
                            value={member.name}
                            onChange={(e) => handleHouseholdMemberChange(index, "name", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-${index}-relationship`} className="text-xs">Relationship</Label>
                          <Input
                            id={`member-${index}-relationship`}
                            value={member.relationship}
                            onChange={(e) => handleHouseholdMemberChange(index, "relationship", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-${index}-age`} className="text-xs">Age</Label>
                          <Input
                            id={`member-${index}-age`}
                            value={member.age}
                            onChange={(e) => handleHouseholdMemberChange(index, "age", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeHouseholdMember(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHouseholdMember}
                  className="w-full"
                >
                  Add Household Member
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Eligibility Information</CardTitle>
                <CardDescription>
                  This information helps us determine eligibility for certain services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="incomeVerification.hasIncome" 
                    checked={formData.incomeVerification.hasIncome}
                    onCheckedChange={(checked) => handleCheckboxChange("incomeVerification.hasIncome", checked as boolean)}
                  />
                  <Label htmlFor="incomeVerification.hasIncome" className="leading-normal">
                    I have a source of income
                  </Label>
                </div>
                
                {formData.incomeVerification.hasIncome && (
                  <div className="space-y-2">
                    <Label htmlFor="incomeVerification.incomeSource">Source of Income</Label>
                    <Input
                      id="incomeVerification.incomeSource"
                      value={formData.incomeVerification.incomeSource}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        incomeVerification: {
                          ...prev.incomeVerification,
                          incomeSource: e.target.value
                        }
                      }))}
                    />
                  </div>
                )}
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="incomeVerification.eligibleForAssistance" 
                    checked={formData.incomeVerification.eligibleForAssistance}
                    onCheckedChange={(checked) => handleCheckboxChange("incomeVerification.eligibleForAssistance", checked as boolean)}
                  />
                  <Label htmlFor="incomeVerification.eligibleForAssistance" className="leading-normal">
                    I am currently eligible for government assistance programs
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referredBy">How did you hear about our services?</Label>
                  <Input
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests or Comments</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Please share any additional information that might help us process your request"
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
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="agreeToFollowUp" 
                    checked={formData.agreeToFollowUp}
                    onCheckedChange={(checked) => handleCheckboxChange("agreeToFollowUp", checked as boolean)}
                  />
                  <Label htmlFor="agreeToFollowUp" className="leading-normal">
                    I agree to be contacted for follow-up regarding my service request
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
                      Submit Service Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceRequest; 
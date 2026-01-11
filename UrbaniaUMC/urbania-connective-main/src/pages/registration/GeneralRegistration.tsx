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
import { toast } from "sonner";
import { ArrowRight, User, Loader2 } from "lucide-react";
import { registrationAPI } from "@/lib/api";
import api from "@/lib/axios";

const GeneralRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    
    // Membership details
    membershipType: "individual", // individual, family, senior, student
    membershipDuration: "yearly", // yearly, monthly, quarterly
    
    // Additional information
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    familyMembers: [], // For family memberships
    
    // Additional preferences
    interests: "",
    referredBy: "",
    
    // Payment information
    paymentMethod: "credit_card", // credit_card, debit_card, check, cash, etc.
    
    // Terms and conditions
    agreeTerms: false,
    receiveUpdates: true
  });
  
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting general registration form:", formData);
      
      // Adapt form data to match API expectations
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        membershipType: formData.membershipType,
        membershipDuration: formData.membershipDuration === "yearly" ? "annual" : formData.membershipDuration,
        emergencyContact: formData.emergencyContact,
        interests: formData.interests,
        referralSource: formData.referredBy,
        paymentInfo: {
          paymentMethod: formData.paymentMethod
        },
        agreeTerms: formData.agreeTerms,
        receiveUpdates: formData.receiveUpdates
      };
      
      // First try using the direct API endpoint
      let response;
      try {
        console.log("Trying direct API call...");
        response = await api.post('/api/registrations/general', apiData);
      } catch (err) {
        console.error("Direct API call failed, trying registrationAPI service...");
        response = await registrationAPI.createGeneralRegistration(apiData);
      }
      
      console.log("Registration response:", response.data);
      
      toast.success("Registration completed successfully!", {
        description: "You'll receive a confirmation email shortly."
      });
      
      // Navigate to confirmation or dashboard
      navigate("/dashboard", { state: { registration: response.data.registration } });
    } catch (error) {
      console.error("Registration error:", error);
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
          <h1 className="text-3xl font-bold mb-2">Community Membership Registration</h1>
          <p className="text-muted-foreground mb-6">
            Join our community and get access to events, programs, and services.
          </p>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your contact details for your membership.
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
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>
                  Select your preferred membership type and options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select 
                    value={formData.membershipType} 
                    onValueChange={(value) => handleSelectChange("membershipType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Membership</SelectItem>
                      <SelectItem value="family">Family Membership</SelectItem>
                      <SelectItem value="senior">Senior Membership</SelectItem>
                      <SelectItem value="student">Student Membership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="membershipDuration">Duration</Label>
                  <Select 
                    value={formData.membershipDuration} 
                    onValueChange={(value) => handleSelectChange("membershipDuration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency.name">Emergency Contact Name</Label>
                  <Input
                    id="emergency.name"
                    name="emergency.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency.phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency.phone"
                      name="emergency.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
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
                  <Label htmlFor="interests">Interests or Community Involvement</Label>
                  <Textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="Please share your interests or how you would like to be involved in the community"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referredBy">How did you hear about us?</Label>
                  <Input
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
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
                    id="receiveUpdates" 
                    checked={formData.receiveUpdates}
                    onCheckedChange={(checked) => handleCheckboxChange("receiveUpdates", checked as boolean)}
                  />
                  <Label htmlFor="receiveUpdates" className="leading-normal">
                    I would like to receive updates about events, programs, and services via email.
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
        </div>
      </div>
    </MainLayout>
  );
};

export default GeneralRegistration; 
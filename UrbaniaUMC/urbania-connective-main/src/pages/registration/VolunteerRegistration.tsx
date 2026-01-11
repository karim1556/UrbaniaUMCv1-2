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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Heart, Loader2, Plus, X } from "lucide-react";
import { registrationAPI } from "@/lib/api";
import api from "@/lib/axios";

// Volunteer types
const volunteerTypes = [
  { id: "regular", name: "Regular Volunteer" },
  { id: "event", name: "Event Volunteer" },
  { id: "specialist", name: "Specialist/Professional" },
  { id: "youth", name: "Youth Volunteer" },
  { id: "senior", name: "Senior Volunteer" },
  { id: "board", name: "Board/Committee Member" },
  { id: "intern", name: "Intern" }
];

// Volunteer areas
const volunteerAreas = [
  "Education & Tutoring",
  "Administrative Support",
  "Event Planning",
  "Fundraising",
  "Community Outreach",
  "Food Services",
  "Youth Programs",
  "Health Services",
  "Translation & Interpretation",
  "Technology Support",
  "Marketing & Communications",
  "Elderly Support",
  "Religious Services",
  "Maintenance & Cleaning",
  "Childcare",
  "Transportation",
  "Counseling"
];

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  
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
    
    // Volunteer details
    volunteerType: "",
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
      timePreference: ""
    },
    skills: [] as string[],
    interests: [] as string[],
    areasOfInterest: [] as string[],
    
    // Experience
    previousExperience: "",
    yearsOfExperience: "",
    
    // Background check
    backgroundCheck: {
      required: true,
      completed: false,
      agreeToCheck: false
    },
    
    // Emergency contact
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    
    // References
    references: [
      { name: "", email: "", phone: "", relationship: "" }
    ],
    
    // Special requests
    specialRequests: "",
    
    // Terms
    agreeTerms: false,
    agreeToCode: false
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
    if (name === "availability.timePreference") {
      setFormData(prev => ({
        ...prev, 
        availability: {
          ...prev.availability,
          timePreference: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.startsWith("availability.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev, 
        availability: {
          ...prev.availability,
          [field]: checked
        }
      }));
    } else if (name.startsWith("backgroundCheck.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev, 
        backgroundCheck: {
          ...prev.backgroundCheck,
          [field]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };
  
  const handleAreaToggle = (area: string) => {
    setFormData(prev => {
      const areas = [...prev.areasOfInterest];
      const index = areas.indexOf(area);
      
      if (index === -1) {
        areas.push(area);
      } else {
        areas.splice(index, 1);
      }
      
      return { ...prev, areasOfInterest: areas };
    });
  };
  
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };
  
  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput("");
    }
  };
  
  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [
        ...prev.references,
        { name: "", email: "", phone: "", relationship: "" }
      ]
    }));
  };
  
  const removeReference = (index: number) => {
    if (formData.references.length > 1) {
      setFormData(prev => ({
        ...prev,
        references: prev.references.filter((_, i) => i !== index)
      }));
    }
  };
  
  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedReferences = [...prev.references];
      updatedReferences[index] = { ...updatedReferences[index], [field]: value };
      return { ...prev, references: updatedReferences };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill out all required personal information");
      return;
    }
    
    if (!formData.volunteerType) {
      toast.error("Please select a volunteer type");
      return;
    }
    
    if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
      toast.error("Please provide emergency contact information");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting volunteer registration form:", formData);
      
      // Prepare data to match API expectations
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        volunteerType: formData.volunteerType,
        availability: {
          weekdays: formData.availability.weekdays,
          weekends: formData.availability.weekends,
          timePreference: formData.availability.timePreference ? [formData.availability.timePreference] : 
            [
              ...(formData.availability.mornings ? ['morning'] : []),
              ...(formData.availability.afternoons ? ['afternoon'] : []),
              ...(formData.availability.evenings ? ['evening'] : [])
            ]
        },
        skills: formData.skills,
        interests: formData.interests,
        areasOfInterest: formData.areasOfInterest,
        previousExperience: formData.previousExperience,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        backgroundCheck: {
          required: formData.backgroundCheck.required,
          completed: formData.backgroundCheck.completed
        },
        emergencyContact: formData.emergencyContact,
        references: formData.references,
        specialRequests: formData.specialRequests,
        agreeTerms: formData.agreeTerms
      };
      
      // First try using the direct API endpoint
      let response;
      try {
        console.log("Trying direct API call...");
        response = await api.post('/api/registrations/volunteer', apiData);
      } catch (err) {
        console.error("Direct API call failed, trying registrationAPI service...", err);
        response = await registrationAPI.createVolunteerRegistration(apiData);
      }
      
      console.log("Registration response:", response?.data);
      
      toast.success("Volunteer registration completed successfully!", {
        description: "Thank you for volunteering. We'll be in touch soon!"
      });
      
      // Navigate to confirmation or dashboard
      navigate("/dashboard", { state: { registration: response.data.registration } });
    } catch (error) {
      console.error("Volunteer registration error:", error);
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
          <h1 className="text-3xl font-bold mb-2">Volunteer Registration</h1>
          <p className="text-muted-foreground mb-6">
            Join our volunteer team and make a difference in the community.
          </p>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your contact details for volunteer registration.
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
                <CardTitle>Volunteer Preferences</CardTitle>
                <CardDescription>
                  Tell us how you'd like to volunteer with our organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="volunteerType">Volunteer Type <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.volunteerType} 
                    onValueChange={(value) => handleSelectChange("volunteerType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select volunteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {volunteerTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="availability.weekdays" 
                        checked={formData.availability.weekdays}
                        onCheckedChange={(checked) => handleCheckboxChange("availability.weekdays", checked as boolean)}
                      />
                      <Label htmlFor="availability.weekdays">Weekdays</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="availability.weekends" 
                        checked={formData.availability.weekends}
                        onCheckedChange={(checked) => handleCheckboxChange("availability.weekends", checked as boolean)}
                      />
                      <Label htmlFor="availability.weekends">Weekends</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="availability.mornings" 
                        checked={formData.availability.mornings}
                        onCheckedChange={(checked) => handleCheckboxChange("availability.mornings", checked as boolean)}
                      />
                      <Label htmlFor="availability.mornings">Mornings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="availability.afternoons" 
                        checked={formData.availability.afternoons}
                        onCheckedChange={(checked) => handleCheckboxChange("availability.afternoons", checked as boolean)}
                      />
                      <Label htmlFor="availability.afternoons">Afternoons</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="availability.evenings" 
                        checked={formData.availability.evenings}
                        onCheckedChange={(checked) => handleCheckboxChange("availability.evenings", checked as boolean)}
                      />
                      <Label htmlFor="availability.evenings">Evenings</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="availability.timePreference">Time Preference</Label>
                  <Select 
                    value={formData.availability.timePreference} 
                    onValueChange={(value) => handleSelectChange("availability.timePreference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="anytime">Any Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Areas of Interest</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {volunteerAreas.map(area => (
                      <Badge
                        key={area}
                        variant={formData.areasOfInterest.includes(area) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleAreaToggle(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Enter a skill (e.g., Web Design, Teaching, etc.)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.skills.map(skill => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interests">Personal Interests</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="interests"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Enter an interest (e.g., Cooking, Sports, etc.)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addInterest}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.interests.map(interest => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {interest}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Experience</CardTitle>
                <CardDescription>
                  Tell us about your previous volunteer or relevant experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="previousExperience">Previous Volunteer Experience</Label>
                  <Textarea
                    id="previousExperience"
                    name="previousExperience"
                    value={formData.previousExperience}
                    onChange={handleChange}
                    placeholder="Please describe your previous volunteer experience"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Volunteer Experience</Label>
                  <Select 
                    value={formData.yearsOfExperience} 
                    onValueChange={(value) => handleSelectChange("yearsOfExperience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                      <SelectItem value="1_3">1-3 years</SelectItem>
                      <SelectItem value="3_5">3-5 years</SelectItem>
                      <SelectItem value="5_plus">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Background Check</CardTitle>
                <CardDescription>
                  Many volunteer positions require a background check.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="backgroundCheck.agreeToCheck" 
                    checked={formData.backgroundCheck.agreeToCheck}
                    onCheckedChange={(checked) => handleCheckboxChange("backgroundCheck.agreeToCheck", checked as boolean)}
                  />
                  <Label htmlFor="backgroundCheck.agreeToCheck" className="leading-normal">
                    I agree to undergo a background check if required for my volunteer position
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Please provide an emergency contact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>References</CardTitle>
                <CardDescription>
                  Please provide at least one reference.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.references.map((reference, index) => (
                  <div key={index} className="space-y-3 p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Reference {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeReference(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`ref-${index}-name`}>Name</Label>
                        <Input
                          id={`ref-${index}-name`}
                          value={reference.name}
                          onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ref-${index}-email`}>Email</Label>
                        <Input
                          id={`ref-${index}-email`}
                          type="email"
                          value={reference.email}
                          onChange={(e) => handleReferenceChange(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`ref-${index}-phone`}>Phone</Label>
                        <Input
                          id={`ref-${index}-phone`}
                          value={reference.phone}
                          onChange={(e) => handleReferenceChange(index, "phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ref-${index}-relationship`}>Relationship</Label>
                        <Input
                          id={`ref-${index}-relationship`}
                          value={reference.relationship}
                          onChange={(e) => handleReferenceChange(index, "relationship", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addReference}
                  className="w-full"
                >
                  Add Another Reference
                </Button>
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
                    placeholder="Please share any additional information or requests"
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
                    id="agreeToCode" 
                    checked={formData.agreeToCode}
                    onCheckedChange={(checked) => handleCheckboxChange("agreeToCode", checked as boolean)}
                  />
                  <Label htmlFor="agreeToCode" className="leading-normal">
                    I agree to abide by the volunteer code of conduct
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

export default VolunteerRegistration; 
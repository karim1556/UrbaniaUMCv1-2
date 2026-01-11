import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HandHeart, Users, GraduationCap, Utensils, Calendar, MapPin, Clock, Heart, Send, CheckCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { volunteerAPI } from "@/lib/api";
import { testApiConnection } from "@/lib/axios";
import { useAuth } from "../lib/authContext";
import { handleAuthRedirect } from "@/lib/utils/auth";

const opportunities = [
  {
    id: "education",
    title: "Education Volunteers",
    description: "Help with teaching, tutoring, and organizing educational programs.",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-700",
    commitment: "4-6 hours per week",
    requirements: [
      "Teaching experience preferred but not required",
      "Patience and good communication skills",
      "Ability to work with diverse age groups"
    ],
    responsibilities: [
      "Assist with weekend school classes",
      "Provide tutoring for students",
      "Help develop educational materials",
      "Support adult education programs"
    ]
  },
  {
    id: "events",
    title: "Events & Programs",
    description: "Support the planning and execution of community events and programs.",
    icon: Calendar,
    color: "bg-purple-50 text-purple-700",
    commitment: "Varies by event (4-8 hours per event)",
    requirements: [
      "Event planning experience helpful",
      "Good organizational skills",
      "Ability to work in a fast-paced environment",
      "Reliable and punctual"
    ],
    responsibilities: [
      "Help set up and clean up for events",
      "Coordinate with vendors and service providers",
      "Assist with registration and check-in",
      "Support event logistics and flow"
    ]
  },
  {
    id: "food",
    title: "Food Distribution",
    description: "Assist with food preparation and distribution for community meals and pantry.",
    icon: Utensils,
    color: "bg-amber-50 text-amber-700",
    commitment: "3-5 hours per week",
    requirements: [
      "Food handling experience helpful",
      "Ability to lift up to 25 pounds",
      "Reliable and dependable",
      "Patient and compassionate attitude"
    ],
    responsibilities: [
      "Help prepare and serve community meals",
      "Package food items for distribution",
      "Organize and stock pantry shelves",
      "Assist with food donation collection and sorting"
    ]
  },
  {
    id: "outreach",
    title: "Community Outreach",
    description: "Help connect with the broader community through various outreach initiatives.",
    icon: HandHeart,
    color: "bg-emerald-50 text-emerald-700",
    commitment: "5-8 hours per week",
    requirements: [
      "Strong communication skills",
      "Cultural sensitivity and awareness",
      "Ability to represent the center professionally",
      "Comfortable speaking with diverse audiences"
    ],
    responsibilities: [
      "Represent the center at community events",
      "Conduct informational sessions",
      "Distribute materials about center programs",
      "Build relationships with community partners"
    ]
  },
  {
    id: "administrative",
    title: "Administrative Support",
    description: "Provide office assistance, data entry, and organizational support.",
    icon: FileText,
    color: "bg-gray-50 text-gray-700",
    commitment: "4-6 hours per week",
    requirements: [
      "Computer proficiency",
      "Attention to detail",
      "Basic office skills",
      "Professional demeanor"
    ],
    responsibilities: [
      "Answer phones and respond to inquiries",
      "Data entry and record keeping",
      "Filing and document organization",
      "Support staff with administrative tasks"
    ]
  },
  {
    id: "youth",
    title: "Youth Mentorship",
    description: "Mentor and support youth through various programs and activities.",
    icon: Users,
    color: "bg-red-50 text-red-700",
    commitment: "6-8 hours per week",
    requirements: [
      "Experience working with youth",
      "Strong role model qualities",
      "Patience and good listening skills",
      "Background check required"
    ],
    responsibilities: [
      "Provide guidance and support to young people",
      "Lead youth activities and discussions",
      "Help with homework and academic support",
      "Organize recreational and educational activities"
    ]
  },
];

const testimonials = [
  {
    quote: "Volunteering at the center has been an incredibly rewarding experience. I've made lasting connections and seen firsthand the positive impact our work has on the community.",
    name: "Sarah J.",
    role: "Education Volunteer",
    years: "2 years",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    quote: "As a food distribution volunteer, I help ensure that no one in our community goes hungry. The gratitude from those we serve makes every hour worth it.",
    name: "Ahmed M.",
    role: "Food Distribution Volunteer",
    years: "3 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    quote: "The youth mentorship program has allowed me to make a meaningful difference in young people's lives. Seeing them grow and develop is incredibly fulfilling.",
    name: "Layla K.",
    role: "Youth Mentor",
    years: "1 year",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
  },
];

const OpportunityCard = ({
  opportunity,
  isActive,
  onClick
}: {
  opportunity: typeof opportunities[0];
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = opportunity.icon;

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
        opportunity.color
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium mb-2">{opportunity.title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{opportunity.description}</p>
      <div className="text-sm text-muted-foreground">
        <div className="flex items-center mb-1">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          <span>{opportunity.commitment}</span>
        </div>
      </div>
    </div>
  );
};

const Volunteering = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [activeOpportunity, setActiveOpportunity] = useState(opportunities[0].id);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    availability: "",
    experience: "",
    address: "",
    motivation: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    checked: boolean;
    exists: boolean;
    message: string;
  } | null>(null);

  const selectedOpportunity = opportunities.find(opp => opp.id === activeOpportunity) || opportunities[0];

  const checkAndRedirect = () => {
    if (!isAuthenticated) {
      handleAuthRedirect(navigate, location.pathname, 'volunteer');
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (activeTab === "apply" && checkAndRedirect()) {
      setActiveTab("opportunities");
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === "apply" && activeOpportunity) {
      setFormData(prev => ({
        ...prev,
        interest: activeOpportunity
      }));
    }
  }, [activeTab, activeOpportunity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkAndRedirect()) return;

    // Enhanced form validation
    const errors = [];

    if (!formData.name || formData.name.trim().length < 2) {
      errors.push("Please enter your full name");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!formData.phone || formData.phone.trim().length < 7) {
      errors.push("Please enter a valid phone number");
    }

    if (!formData.interest) {
      errors.push("Please select an area of interest");
    }

    if (!formData.availability) {
      errors.push("Please select your availability");
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await volunteerAPI.apply(formData);

      toast.success("Volunteer application submitted successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        interest: "",
        availability: "",
        experience: "",
        address: "",
        motivation: ""
      });
      setActiveTab("opportunities");
    } catch (error: any) {
      console.error("Error submitting volunteer application:", error);
      toast.error(error.response?.data?.message || "Error submitting application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyForRole = (roleId: string) => {
    if (checkAndRedirect()) return;
    setActiveOpportunity(roleId);
    setFormData(prev => ({
      ...prev,
      interest: roleId
    }));
    setActiveTab("apply");
  };

  const checkEmailExists = async (email: string) => {
    if (!email || email.trim().length === 0 || !email.includes('@')) return;

    try {
      const response = await volunteerAPI.checkEmailExists(email.trim());
      const { exists, message } = response.data;

      setEmailStatus({
        checked: true,
        exists,
        message
      });

      if (exists) {
        toast.info(message, {
          duration: 5000,
          position: 'top-center'
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailStatus(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));

    // Reset email status when the user changes the email
    setEmailStatus(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email.includes('@') && formData.email.length > 5) {
        checkEmailExists(formData.email);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleApplyClick = () => {
    if (checkAndRedirect()) return;
    setActiveTab("apply");
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Volunteer With Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Join our dedicated team of volunteers to make a difference in the community.
              We offer various volunteering opportunities to match your skills and interests.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-24">
                  <div className="p-4 bg-primary/5 border-b">
                    <h2 className="font-medium text-lg">Volunteer Roles</h2>
                  </div>
                  <nav className="p-2">
                    <ul className="space-y-1">
                      {opportunities.map((opportunity) => {
                        const Icon = opportunity.icon;
                        return (
                          <li key={opportunity.id}>
                            <button
                              onClick={() => setActiveOpportunity(opportunity.id)}
                              className={cn(
                                "w-full flex items-center text-left px-3 py-2 rounded-md text-sm transition-colors",
                                activeOpportunity === opportunity.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-accent/50 text-foreground/80"
                              )}
                            >
                              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{opportunity.title}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className={cn(
                      "w-14 h-14 rounded-lg mb-6 flex items-center justify-center",
                      selectedOpportunity.color
                    )}>
                      {React.createElement(selectedOpportunity.icon, { className: "h-7 w-7" })}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-display font-medium mb-4">
                      {selectedOpportunity.title}
                    </h2>

                    <p className="text-muted-foreground mb-6">
                      {selectedOpportunity.description}
                    </p>

                    <h3 className="text-lg font-medium mb-4">Time Commitment:</h3>
                    <p className="text-muted-foreground mb-6 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      {selectedOpportunity.commitment}
                    </p>

                    <h3 className="text-lg font-medium mb-4">Requirements:</h3>
                    <ul className="list-disc pl-5 mb-6 text-muted-foreground space-y-2">
                      {selectedOpportunity.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>

                    <h3 className="text-lg font-medium mb-4">Responsibilities:</h3>
                    <ul className="space-y-2 mb-6">
                      {selectedOpportunity.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{resp}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => handleApplyForRole(selectedOpportunity.id)} className="gap-2">
                        Apply for This Role
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/contact?subject=Volunteer%20Inquiry">
                          Ask Questions
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-xl border">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-lg font-medium">Why Volunteer With Us?</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Make a meaningful difference in your community</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Develop new skills and gain valuable experience</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Connect with like-minded individuals</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Flexible scheduling to accommodate your availability</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Training and support provided for all volunteer roles</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card rounded-xl border shadow-sm p-6">
                  <div className="text-primary mb-4 text-2xl font-serif">"</div>
                  <p className="text-muted-foreground italic mb-6">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} | {testimonial.years}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-xl p-8 mt-8 text-center">
              <h3 className="text-2xl font-display font-medium mb-4">Share Your Experience</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
                Are you a current or former volunteer who would like to share your experience?
                We'd love to hear from you and possibly feature your testimonial.
              </p>
              <Button asChild>
                <Link to="/contact?subject=Volunteer%20Testimonial">Share Your Story</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="apply" className="space-y-8">
            <div className="max-w-2xl mx-auto bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-display font-medium mb-6">
                  Volunteer Application
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
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
                          onChange={handleEmailChange}
                          className={emailStatus?.exists ? "border-yellow-500 focus-visible:ring-yellow-500" : ""}
                          required
                        />
                        {emailStatus?.exists && (
                          <p className="text-yellow-600 text-sm mt-1">
                            You've already submitted an application with this email, but you can submit another one if needed.
                          </p>
                        )}
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
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter your full address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="interest">Area of Interest</Label>
                      <Select
                        value={formData.interest}
                        onValueChange={(value) => handleSelectChange('interest', value)}
                      >
                        <SelectTrigger id="interest">
                          <SelectValue placeholder="Select an area you're interested in" />
                        </SelectTrigger>
                        <SelectContent>
                          {opportunities.map((opp) => (
                            <SelectItem key={opp.id} value={opp.id}>
                              {opp.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="availability">Availability</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => handleSelectChange('availability', value)}
                      >
                        <SelectTrigger id="availability">
                          <SelectValue placeholder="Select your availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekdays">Weekdays</SelectItem>
                          <SelectItem value="weekends">Weekends</SelectItem>
                          <SelectItem value="evenings">Evenings</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        placeholder="Tell us about any relevant experience or skills you have"
                        rows={4}
                        value={formData.experience}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="motivation">Motivation</Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        placeholder="Tell us why you want to volunteer with us"
                        rows={4}
                        value={formData.motivation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Submitting Application...</>
                    ) : (
                      <>
                        Submit Application
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to be contacted by our volunteer coordinator
                    regarding opportunities at the Urbania Welfare Community Center.
                  </p>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-8">
              Have questions about volunteering with us? Here are answers to some commonly asked questions.
            </p>
            <div className="text-left space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">What is the minimum age to volunteer?</h3>
                <p className="text-muted-foreground">
                  The minimum age varies by program. Most volunteer roles require volunteers to be at least 16 years old.
                  Youth between 13-15 can volunteer alongside a parent or guardian.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Do I need previous experience?</h3>
                <p className="text-muted-foreground">
                  While experience is helpful for some roles, it's not required for most positions.
                  We provide training and support for all our volunteers.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Is there a minimum time commitment?</h3>
                <p className="text-muted-foreground">
                  We appreciate any time you can give, but most roles request a commitment of at least 3-6 months
                  to provide consistency for our programs and those we serve.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Can I volunteer for multiple programs?</h3>
                <p className="text-muted-foreground">
                  Yes! Many of our volunteers contribute to multiple programs based on their interests and availability.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/contact?subject=Volunteer%20Questions">Ask More Questions</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Volunteering;

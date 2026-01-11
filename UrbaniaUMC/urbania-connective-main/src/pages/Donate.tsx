import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, IndianRupee, Building, GraduationCap, Users, HandHeart, Send, Loader2 } from "lucide-react";
import { donationAPI } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { generateObjectId } from "@/lib/utils";

const donationPrograms = [
  {
    id: "general",
    title: "General Fund",
    description: "Support all of our programs and services based on current needs.",
    icon: Heart,
    color: "bg-red-50 text-red-700"
  },
  {
    id: "education",
    title: "Education Programs",
    description: "Support our educational initiatives, classes, and workshops.",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-700"
  },
  {
    id: "community",
    title: "Community Services",
    description: "Help us provide essential services to those in need in our community.",
    icon: Users,
    color: "bg-amber-50 text-amber-700"
  },
  {
    id: "zakat",
    title: "Zakat Fund",
    description: "Contribute to our Zakat fund to help those eligible for Zakat.",
    icon: HandHeart,
    color: "bg-green-50 text-green-700"
  },
  {
    id: "sadka",
    title: "Sadka/Charity Fund",
    description: "Support our Sadka and general charity initiatives for the needy.",
    icon: HandHeart,
    color: "bg-emerald-50 text-emerald-700"
  },
  {
    id: "greenhouse_building",
    title: "Greenhouse Building Fund",
    description: "Help us build new greenhouses for community sustainability.",
    icon: Building,
    color: "bg-lime-50 text-lime-700"
  },
  {
    id: "greenhouse_maintenance",
    title: "Greenhouse Maintenance Fund",
    description: "Support the ongoing maintenance of our greenhouses.",
    icon: Building,
    color: "bg-teal-50 text-teal-700"
  },
  {
    id: "platform_building",
    title: "Community Platform Building Fund",
    description: "Contribute to building and improving our community platform.",
    icon: Building,
    color: "bg-indigo-50 text-indigo-700"
  },
  {
    id: "interest_free_loans",
    title: "Fund for Interest-Free Loans to Needy",
    description: "Provide interest-free loans to those in need within our community.",
    icon: IndianRupee,
    color: "bg-yellow-50 text-yellow-700"
  }
];

const donationAmounts = [25, 50, 100, 250, 500, 1000];
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

const DonatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("one-time");
  const [donationProgram, setDonationProgram] = useState("general");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: "",
    state: "",
    zipCode: "",
    anonymous: false,
    receiptRequired: true,
    message: ""
  });

  // Require login for donation
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message: 'Please login to make a donation.'
        },
        replace: true
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Update donor info when user changes
  useEffect(() => {
    if (user) {
      setDonorInfo(prev => ({
        ...prev,
        firstName: user?.name?.split(' ')[0] || prev.firstName,
        lastName: user?.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone,
        address: user?.address || prev.address
      }));
    }
  }, [user]);

  const handleAmountSelection = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric or non-decimal characters
    const value = e.target.value.replace(/[^\d.]/g, "");
    
    // Ensure only one decimal point
    const parts = value.split('.');
    const formattedValue = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}` 
      : value;
    
    setCustomAmount(formattedValue);
    setSelectedAmount(null);
  };

  const handleDonorInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setDonorInfo(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setDonorInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    // Ensure email is present before proceeding
    if (!donorInfo.email || !donorInfo.email.includes('@')) {
      toast.error("A valid email address is required to receive a donation receipt.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get the donation amount
      const amount = getEffectiveAmount();

      if (amount <= 0) {
        toast.error("Please select or enter a valid donation amount");
        setIsSubmitting(false);
        return;
      }

      // Required fields validation
      const errors = [];
      
      if (!donorInfo.email) {
        errors.push("Email address is required");
      }

      if (!donorInfo.anonymous && (!donorInfo.firstName || !donorInfo.lastName)) {
        errors.push("First and last name are required unless making an anonymous donation");
      }

      if (!user?._id) {
        errors.push("You must be logged in to make a donation");
      }

      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        setIsSubmitting(false);
        return;
      }

      // Generate a new MongoDB ObjectId for the donation
      const donationId = generateObjectId();

      // Create donation data
      const donationData = {
        _id: donationId, // Required specific donation ID
        donor: user?._id, // Required donor ID (must match logged-in user)
        firstName: donorInfo.firstName,
        lastName: donorInfo.lastName,
        email: donorInfo.email,
        phone: donorInfo.phone || "",
        address: donorInfo.address || "",
        city: donorInfo.city || "",
        state: donorInfo.state || "",
        zipCode: donorInfo.zipCode || "",
        amount,
        currency: "INR",
        program: donationProgram,
        donationType: 'one-time',
        anonymous: donorInfo.anonymous,
        receiptRequired: donorInfo.receiptRequired,
        message: donorInfo.message || ""
      };

      // Process the donation and get Razorpay order
      console.log('Processing donation with data:', donationData);
      const response = await donationAPI.processDonation(donationData as any);
      console.log('Donation API response:', response.data);
      
      // Wait for Razorpay to be loaded
      await waitForRazorpay();
      
      // Initialize Razorpay
      console.log('Razorpay key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
      console.log('Order ID:', response.data.orderId);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.data.donation.amount * 100, // Convert to smallest currency unit
        currency: response.data.donation.currency,
        name: sanitizeForRazorpay("Urbania Connective"),
        description: sanitizeForRazorpay(`${donationProgram} Donation`),
        order_id: response.data.orderId, // Use the Razorpay order ID
        handler: async (response: any) => {
          try {
            // Confirm the payment
            await donationAPI.confirmPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              phone: donorInfo.phone,
              address: donorInfo.address,
              city: donorInfo.city,
              state: donorInfo.state,
              zipCode: donorInfo.zipCode,
              receiptRequired: donorInfo.receiptRequired
            });

            toast.success("Thank you for your donation!");
            navigate('/donation-success', {
              state: {
                donationDetails: {
                  amount: getEffectiveAmount().toFixed(2),
                  program: donationPrograms.find(p => p.id === donationProgram)?.title || donationProgram,
                  date: new Date().toLocaleDateString(),
                  transactionId: response.razorpay_payment_id || response.razorpay_order_id || '',
                  receiptNumber: response.razorpay_order_id || ''
                }
              }
            });
          } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error("Failed to confirm payment. Please contact support or try again.");
            navigate('/donation-success', {
              state: {
                donationDetails: {
                  amount: getEffectiveAmount().toFixed(2),
                  program: donationPrograms.find(p => p.id === donationProgram)?.title || donationProgram,
                  date: new Date().toLocaleDateString(),
                  transactionId: response.razorpay_payment_id || response.razorpay_order_id || '',
                  receiptNumber: response.razorpay_order_id || '',
                  error: true
                }
              }
            });
          }
        },
        prefill: {
          name: donorInfo.anonymous ? "Anonymous Donor" : sanitizeForRazorpay(`${donorInfo.firstName} ${donorInfo.lastName}`),
          email: donorInfo.email,
          contact: donorInfo.phone || "",
          address: donorInfo.address || "",
          city: donorInfo.city || "",
          state: donorInfo.state || "",
          zipcode: donorInfo.zipCode || ""
        },
        notes: {
          program: sanitizeForRazorpay(donationProgram),
          donationType: 'one-time',
          anonymous: donorInfo.anonymous.toString(),
          message: sanitizeForRazorpay(donorInfo.message || "")
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const razorpay = new window.Razorpay(options);
      
      // Add error handling for Razorpay modal
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        toast.error("Payment failed. Please try again.");
      });
      
      razorpay.on('payment.canceled', () => {
        console.log('Payment canceled by user');
        toast.info("Payment was canceled.");
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Donation error:', error);
      toast.error("Failed to process donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEffectiveAmount = (): number => {
    if (selectedAmount !== null) {
      return selectedAmount;
    }
    
    const parsed = parseFloat(customAmount);
    return !isNaN(parsed) ? parsed : 0;
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Donate
            </h1>
            <p className="text-lg text-muted-foreground">
              Support our community initiatives and programs through your generous donations.
              Your contribution helps us continue providing essential services and support to those in need.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-display font-medium mb-6">
                  Make a Donation
                </h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-1 mb-6">
                    <TabsTrigger value="one-time">One-Time Donation</TabsTrigger>
                  </TabsList>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Choose a Donation Program</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {donationPrograms.map((program) => (
                            <div 
                              key={program.id}
                              className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                donationProgram === program.id 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : "hover:border-primary/30 hover:bg-primary/5"
                              }`}
                              onClick={() => setDonationProgram(program.id)}
                            >
                              <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${program.color}`}>
                                <program.icon className="h-5 w-5" />
                              </div>
                              <h4 className="font-medium mb-1">{program.title}</h4>
                              <p className="text-xs text-muted-foreground">{program.description}</p>
                              
                              {donationProgram === program.id && (
                                <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Select Donation Amount</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                          {donationAmounts.map((amount) => (
                            <button
                              type="button"
                              key={amount}
                              className={`p-3 border rounded-md text-center transition-all hover:border-primary ${
                                selectedAmount === amount
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card hover:bg-primary/5"
                              }`}
                              onClick={() => handleAmountSelection(amount)}
                            >
                              ₹{amount}
                            </button>
                          ))}
                        </div>
                        
                        <div className="relative mt-3">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <IndianRupee className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Input
                            type="text"
                            placeholder="Other Amount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Your Information</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={donorInfo.firstName}
                                onChange={handleDonorInfoChange}
                                required={!donorInfo.anonymous}
                                disabled={donorInfo.anonymous}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={donorInfo.lastName}
                                onChange={handleDonorInfoChange}
                                required={!donorInfo.anonymous}
                                disabled={donorInfo.anonymous}
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
                                value={donorInfo.email}
                                onChange={handleDonorInfoChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={donorInfo.phone}
                                onChange={handleDonorInfoChange}
                                required={!donorInfo.anonymous}
                                disabled={donorInfo.anonymous}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={donorInfo.address}
                              onChange={handleDonorInfoChange}
                              required={!donorInfo.anonymous && donorInfo.receiptRequired}
                              disabled={donorInfo.anonymous}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                name="city"
                                value={donorInfo.city}
                                onChange={handleDonorInfoChange}
                                required={!donorInfo.anonymous && donorInfo.receiptRequired}
                                disabled={donorInfo.anonymous}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Select
                                value={donorInfo.state}
                                onValueChange={(value) => handleSelectChange("state", value)}
                                disabled={donorInfo.anonymous}
                              >
                                <SelectTrigger id="state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {INDIAN_STATES.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="zipCode">Zip Code</Label>
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={donorInfo.zipCode}
                                onChange={handleDonorInfoChange}
                                required={!donorInfo.anonymous && donorInfo.receiptRequired}
                                disabled={donorInfo.anonymous}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="anonymous"
                                checked={donorInfo.anonymous}
                                onCheckedChange={(checked) => 
                                  handleCheckboxChange("anonymous", checked === true)
                                }
                              />
                              <Label htmlFor="anonymous" className="cursor-pointer">
                                Make my donation anonymous
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="receiptRequired"
                                checked={donorInfo.receiptRequired}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange("receiptRequired", checked === true)
                                }
                                disabled={donorInfo.anonymous}
                              />
                              <Label 
                                htmlFor="receiptRequired" 
                                className={`${donorInfo.anonymous ? "text-muted-foreground" : "cursor-pointer"}`}
                              >
                                I would like a receipt for tax purposes
                              </Label>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                              id="message"
                              name="message"
                              placeholder="Share why you're making this donation or any special instructions..."
                              value={donorInfo.message}
                              onChange={handleDonorInfoChange}
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h3 className="font-medium mb-2">Donation Summary</h3>
                          <div className="flex justify-between mb-1">
                            <span>Program:</span>
                            <span className="font-medium">{donationPrograms.find(p => p.id === donationProgram)?.title}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Donation Type:</span>
                            <span className="font-medium">One-Time</span>
                          </div>
                          <div className="flex justify-between text-lg font-medium">
                            <span>Amount:</span>
                            <span className="text-primary">₹{getEffectiveAmount().toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          disabled={isSubmitting || getEffectiveAmount() <= 0}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Complete Donation
                              <Send className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        
                        <p className="text-sm text-muted-foreground text-center">
                          By completing this donation, you agree to the terms and conditions of 
                          Urbania Welfare Community Center. All donations are processed securely.
                        </p>
                      </div>
                    </div>
                  </form>
                </Tabs>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Why Donate?</h3>
                <div className="space-y-4 text-sm">
                  <p>
                    Your donation helps us continue our mission to serve the community through education, support services, and outreach programs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="mt-1 mr-2 text-primary">•</div>
                      <p>Support educational workshops and classes for all ages</p>
                    </div>
                    <div className="flex items-start">
                      <div className="mt-1 mr-2 text-primary">•</div>
                      <p>Fund community service initiatives for those in need</p>
                    </div>
                    <div className="flex items-start">
                      <div className="mt-1 mr-2 text-primary">•</div>
                      <p>Help maintain and improve our facilities</p>
                    </div>
                    <div className="flex items-start">
                      <div className="mt-1 mr-2 text-primary">•</div>
                      <p>Enable charitable work in the local community</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Questions about donating?</h4>
                    <p className="mb-3">
                      If you have any questions about making a donation or need assistance, please contact our donations team.
                    </p>
                    <div className="text-sm">
                      <p><span className="font-medium">Email:</span> donations@example.org</p>
                      <p><span className="font-medium">Phone:</span> (123) 456-7890</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Tax Information</h4>
                    <p>
                      All donations are tax-deductible to the extent allowed by law. A receipt will be provided for your records if requested.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Your Impact</h2>
            <p className="text-muted-foreground mb-8">
              See how your donations make a difference in our community through our various programs and services.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="font-medium">Families Supported</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Families received food, financial, and social support last year
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
                  <div className="font-medium">Educational Hours</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hours of educational programming and tutoring provided
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">85%</div>
                  <div className="font-medium">Direct Services</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Of every rupee goes directly to community programs
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Button variant="outline" asChild>
              <a href="/about#annual-report">View Our Annual Report</a>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonatePage;

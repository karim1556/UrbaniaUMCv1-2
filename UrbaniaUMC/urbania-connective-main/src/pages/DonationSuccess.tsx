import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import { 
  CheckCircle, 
  Heart, 
  ArrowLeft, 
  Send, 
  IndianRupee, 
  Calendar, 
  Mail, 
  FileText, 
  Share2,
  Clock,
  Users,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const DonationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const donationDetails = location.state?.donationDetails || {
    amount: "50.00",
    program: "General Fund",
    date: new Date().toLocaleDateString(),
    transactionId: "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    receiptNumber: "R" + Math.random().toString(36).substr(2, 9).toUpperCase()
  };

  const [impactStats, setImpactStats] = useState<{ familiesSupported: number; fundsToProgramsPercent: number } | null>(null);

  useEffect(() => {
    fetch('/api/donations/community-impact')
      .then(res => res.json())
      .then(data => setImpactStats(data));
  }, []);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="success" className="bg-primary/10 text-primary hover:bg-primary/20">
                Payment Successful
              </Badge>
              <Badge variant="outline" className="border-primary/20">
                Transaction ID: {donationDetails.transactionId}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-3">
              Thank You for Your Donation
            </h1>
            <p className="text-lg text-muted-foreground">
              Your generous contribution will help us continue our mission to serve the community through education, support services, and outreach programs.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Main Success Card */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                    <CheckCircle className="w-16 h-16 text-primary relative z-10" />
                  </div>
                  <h2 className="text-2xl font-display font-medium mb-2">
                    Donation Successful
                  </h2>
                  <p className="text-muted-foreground max-w-2xl">
                    A confirmation email has been sent to your registered email address with the donation details and receipt.
                  </p>
                </div>

                {/* Donation Details */}
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-3">Donation Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">₹{donationDetails.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Program:</span>
                      <span className="font-medium">{donationDetails.program}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{donationDetails.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Receipt:</span>
                      <span className="font-medium">{donationDetails.receiptNumber}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Impact and Next Steps */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <Heart className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-display text-lg font-medium mb-2">Your Impact</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Your donation will support:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <div className="mt-1 mr-2 text-primary">•</div>
                          <span>Educational programs and workshops</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mt-1 mr-2 text-primary">•</div>
                          <span>Community support services</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mt-1 mr-2 text-primary">•</div>
                          <span>Welfare initiatives for families in need</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4 border">
                    <Clock className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-display text-lg font-medium mb-2">Next Steps</h3>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start">
                        <Mail className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>Check your email for the donation confirmation and receipt</span>
                      </li>
                      <li className="flex items-start">
                        <FileText className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>Access your tax receipt in your account dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <Share2 className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>Share your support to inspire others in the community</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="h-4 w-4" />
            Return to Home
                  </Button>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => navigate('/donate')}
          >
            Make Another Donation
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-8">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-3">Community Impact</h3>
                <div className="space-y-4 text-sm">
                  {/* Community Impact */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-muted-foreground text-sm">Families Supported</div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-muted-foreground text-sm">Funds to Programs</div>
                    </div>
                  </div>

                  {/* Monthly Goals */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Monthly Goals</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-start">
                        <Users className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Support 50 New Families</p>
                          <p className="text-xs text-muted-foreground">Through various welfare programs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Target className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">Launch New Programs</p>
                          <p className="text-xs text-muted-foreground">Educational and community initiatives</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-medium mb-2">Need Assistance?</h4>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Our donation support team is here to help with any questions.
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="font-medium">donations@example.org</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <a href="/faq" className="text-primary hover:underline">View FAQs</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonationSuccess; 
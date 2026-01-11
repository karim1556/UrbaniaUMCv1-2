import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Heart, 
  BookOpen, 
  Briefcase, 
  Stethoscope, 
  HandHeart, 
  Users, 
  Building, 
  IndianRupee, 
  BookText, 
  Library,
  Phone,
  Calendar,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { servicePostService, ServicePost } from '@/services/servicePostService';
import ServicePostCard from '@/components/ServicePostCard';

const services = [
  {
    id: "newcomer",
    title: "Newcomer Support (Ansar)",
    description: "Helping newcomers integrate into the community with resources and guidance.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700",
    details: [
      "Settlement assistance for new arrivals",
      "Language services and translation",
      "Cultural orientation programs",
      "Community introduction and networking",
      "Resource referrals and guidance"
    ]
  },
  {
    id: "medical",
    title: "Medical Clinic",
    description: "Free medical consultations and health services for community members.",
    icon: Stethoscope,
    color: "bg-blue-50 text-blue-700",
    details: [
      "General medical consultations",
      "Basic health screenings",
      "Prescription assistance",
      "Health education workshops",
      "Mental health support",
      "Referrals to specialists"
    ]
  },
  {
    id: "financial",
    title: "Financial Aid",
    description: "Financial assistance for community members facing hardship.",
    icon: IndianRupee,
    color: "bg-green-50 text-green-700",
    details: [
      "Emergency financial assistance",
      "Rent and utilities support",
      "Food assistance programs",
      "Financial literacy workshops",
      "Zakat and Sadaqah distribution",
      "Referrals to employment opportunities"
    ]
  },
  {
    id: "social",
    title: "Social Services",
    description: "Support services addressing various social needs in our community.",
    icon: HandHeart,
    color: "bg-purple-50 text-purple-700",
    details: [
      "Family counseling",
      "Youth mentorship programs",
      "Senior support services",
      "Community advocacy",
      "Conflict resolution",
      "Crisis intervention"
    ]
  },
  {
    id: "education",
    title: "Educational Programs",
    description: "Classes, workshops and programs for intellectual and spiritual growth.",
    icon: BookOpen,
    color: "bg-amber-50 text-amber-700",
    details: [
      "Islamic studies classes",
      "Language courses (Arabic, etc.)",
      "After-school tutoring",
      "Summer educational programs",
      "Adult education workshops",
      "Professional development courses"
    ]
  },
  {
    id: "nikah",
    title: "Nikah Services",
    description: "Marriage services including counseling, documentation and ceremonies.",
    icon: Heart,
    color: "bg-red-50 text-red-700",
    details: [
      "Pre-marital counseling",
      "Nikah (Islamic marriage) ceremony",
      "Marriage certificate issuance",
      "Marriage preparation courses",
      "Family counseling",
      "Marital dispute resolution"
    ]
  },
  {
    id: "funeral",
    title: "Funeral Support",
    description: "Assistance with funeral arrangements and support during difficult times.",
    icon: HandHeart,
    color: "bg-gray-50 text-gray-700",
    details: [
      "Janazah (funeral) arrangements",
      "Ghusl (washing) services",
      "Burial coordination",
      "Cemetery arrangements",
      "Grief counseling",
      "Estate planning guidance"
    ]
  },
  {
    id: "facilities",
    title: "Facilities Services",
    description: "Venue spaces for community events, classes, and private functions.",
    icon: Building,
    color: "bg-indigo-50 text-indigo-700",
    details: [
      "Event hall rentals",
      "Classroom spaces",
      "Conference rooms",
      "Sports facilities",
      "Kitchen and dining areas",
      "Audio-visual equipment"
    ]
  },
  {
    id: "new-muslim",
    title: "New Muslim Service",
    description: "Support and education for new Muslims and those interested in Islam.",
    icon: BookText,
    color: "bg-teal-50 text-teal-700",
    details: [
      "Shahada (conversion) services",
      "Basic Islamic teachings",
      "Mentorship programs",
      "Community integration",
      "Educational resources",
      "Support groups"
    ]
  },
  {
    id: "special-needs",
    title: "Special Needs Services",
    description: "Specialized programs and support for individuals with special needs.",
    icon: HandHeart,
    color: "bg-cyan-50 text-cyan-700",
    details: [
      "Specialized education programs",
      "Support groups for families",
      "Accessibility services",
      "Recreational activities",
      "Resource referrals",
      "Respite care coordination"
    ]
  },
  {
    id: "matrimony",
    title: "Matrimony Services",
    description: "Matchmaking services for Muslims seeking marriage partners.",
    icon: Heart,
    color: "bg-pink-50 text-pink-700",
    details: [
      "Matrimonial database",
      "Supervised introductions",
      "Background verification",
      "Pre-marital counseling",
      "Matrimonial events",
      "Online matching platform"
    ]
  },
];

const ServicesPage = () => {
  const [activeService, setActiveService] = useState("newcomer");
  const [allPosts, setAllPosts] = useState<ServicePost[]>([]);

  const selectedService = services.find(service => service.id === activeService) || services[0];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await servicePostService.getAllPosts();
        setAllPosts(data || []);
      } catch (err) {
        console.error('Failed to load service posts', err);
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground">
              We offer a wide range of services to support and enrich our community. 
              From essential welfare assistance to educational programs and spiritual guidance, we're here to help.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden sticky top-24">
              <div className="p-4 bg-primary/5 border-b">
                <h2 className="font-medium text-lg">All Services</h2>
              </div>
              <nav className="p-2">
                <ul className="space-y-1">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <li key={service.id}>
                        <button
                          onClick={() => setActiveService(service.id)}
                          className={cn(
                            "w-full flex items-center text-left px-3 py-2 rounded-md text-sm transition-colors",
                            activeService === service.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-accent/50 text-foreground/80"
                          )}
                        >
                          <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{service.title}</span>
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
                  selectedService.color
                )}>
                  {React.createElement(selectedService.icon, { className: "h-7 w-7" })}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-display font-medium mb-4">
                  {selectedService.title}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {selectedService.description}
                </p>
                
                <h3 className="text-lg font-medium mb-4">Services Provided:</h3>
                <ul className="space-y-2 mb-6">
                  {selectedService.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link to={`/contact?service=${selectedService.id}`}>
                      Request This Service
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">Contact Information</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <span>Monday - Friday, 9AM - 5PM</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="font-medium text-lg mb-4">How to Request</h3>
                <p className="text-muted-foreground mb-4">
                  Contact us directly, fill out our online form, or visit our center to access any of our services.
                </p>
                <Link 
                  to="/contact" 
                  className="text-primary font-medium inline-flex items-center hover:underline"
                >
                  Contact Us
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-8">
              If you're unsure which service you need or have questions about our offerings, 
              please don't hesitate to reach out. We're here to help guide you to the right resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/volunteering">Volunteer With Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* All service posts section */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl font-display font-medium mb-6">All Service Posts</h2>
        {allPosts.length === 0 ? (
          <div className="text-muted-foreground">No posts available.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map(p => (
              <ServicePostCard key={p._id} post={p as any} serviceId={p.serviceId} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServicesPage;

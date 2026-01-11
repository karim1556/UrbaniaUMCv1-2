import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
  Library 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "newcomer",
    title: "Newcomer Support (Ansar)",
    description: "Helping newcomers integrate into the community with resources and guidance.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "medical",
    title: "Medical Clinic",
    description: "Free medical consultations and health services for community members.",
    icon: Stethoscope,
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "financial",
    title: "Financial Aid",
    description: "Financial assistance for community members facing hardship.",
    icon: IndianRupee,
    color: "bg-green-50 text-green-700",
  },
  {
    id: "social",
    title: "Social Services",
    description: "Support services addressing various social needs in our community.",
    icon: HandHeart,
    color: "bg-purple-50 text-purple-700",
  },
  {
    id: "education",
    title: "Educational Programs",
    description: "Classes, workshops and programs for intellectual and spiritual growth.",
    icon: BookOpen,
    color: "bg-amber-50 text-amber-700",
  },
  {
    id: "nikah",
    title: "Nikah Services",
    description: "Marriage services including counseling, documentation and ceremonies.",
    icon: Heart,
    color: "bg-red-50 text-red-700",
  },
  {
    id: "funeral",
    title: "Funeral Support",
    description: "Assistance with funeral arrangements and support during difficult times.",
    icon: Heart,
    color: "bg-gray-50 text-gray-700",
  },
  {
    id: "facilities",
    title: "Facilities Services",
    description: "Venue spaces for community events, classes, and private functions.",
    icon: Building,
    color: "bg-indigo-50 text-indigo-700",
  },
];

const ServiceCard = ({ 
  service, 
  isActive, 
  onClick 
}: { 
  service: typeof services[0]; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const Icon = service.icon;
  
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
        service.color
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium mb-2">{service.title}</h3>
      <p className="text-muted-foreground text-sm">{service.description}</p>
      <div className={cn(
        "absolute bottom-6 right-6 opacity-0 transition-opacity duration-300",
        isActive || "group-hover:opacity-100"
      )}>
        <ArrowRight className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
};

const Services = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  return (
    <section className="py-16 section-fade-in">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-4">Our Services</h2>
          <p className="text-muted-foreground">
            We offer a wide range of services to support and enrich our community. 
            From essential welfare assistance to educational programs and spiritual guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              isActive={activeService === service.id}
              onClick={() => setActiveService(service.id === activeService ? null : service.id)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link to="/services" className="gap-2 group">
              Explore All Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;

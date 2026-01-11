// React import not required with the new JSX transform
import MainLayout from "@/components/layout/MainLayout";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Phone, Calendar, ArrowRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { servicePostService, ServicePost } from '@/services/servicePostService';
import ServicePostCard from '@/components/ServicePostCard';

// Service data
const services = [
  {
    id: "newcomer",
    title: "Newcomer Support (Ansar)",
    description: "Helping newcomers integrate into the community with resources and guidance.",
    icon: "Users",
    color: "bg-emerald-50 text-emerald-700",
    details: [
      "Settlement assistance for new arrivals",
      "Language services and translation",
      "Cultural orientation programs",
      "Community introduction and networking",
      "Resource referrals and guidance"
    ],
    fullDescription: "Our Newcomer Support (Ansar) program is designed to help immigrants and refugees settle into their new community. We provide comprehensive assistance including language support, cultural orientation, resource referrals, and community integration activities. Our team of dedicated volunteers works closely with newcomers to ensure they feel welcomed and supported during this important transition period."
  },
  {
    id: "medical",
    title: "Medical Clinic",
    description: "Free medical consultations and health services for community members.",
    icon: "Stethoscope",
    color: "bg-blue-50 text-blue-700",
    details: [
      "General medical consultations",
      "Basic health screenings",
      "Prescription assistance",
      "Health education workshops",
      "Mental health support",
      "Referrals to specialists"
    ],
    fullDescription: "Our Medical Clinic provides essential healthcare services to community members who may not have access to regular medical care. Staffed by volunteer healthcare professionals, we offer consultations, basic health screenings, and referrals for specialized care. Our clinic also conducts regular health education workshops on various topics to promote wellness and preventive care in our community."
  },
  {
    id: "financial",
    title: "Financial Aid",
    description: "Financial assistance for community members facing hardship.",
    icon: "IndianRupee",
    color: "bg-green-50 text-green-700",
    details: [
      "Emergency financial assistance",
      "Rent and utilities support",
      "Food assistance programs",
      "Financial literacy workshops",
      "Zakat and Sadaqah distribution",
      "Referrals to employment opportunities"
    ],
    fullDescription: "Our Financial Aid program provides emergency and ongoing financial support to individuals and families experiencing economic hardship. We assist with rent, utilities, food, and other essential needs through both direct aid and referrals to additional resources. We also offer financial literacy workshops to help community members develop skills for long-term financial stability and independence."
  },
  {
    id: "social",
    title: "Social Services",
    description: "Support services addressing various social needs in our community.",
    icon: "HandHeart",
    color: "bg-purple-50 text-purple-700",
    details: [
      "Family counseling",
      "Youth mentorship programs",
      "Senior support services",
      "Community advocacy",
      "Conflict resolution",
      "Crisis intervention"
    ],
    fullDescription: "Our Social Services program offers a range of support services to address the diverse needs of our community members. From family counseling and youth mentorship to senior support and crisis intervention, our team is equipped to help individuals and families navigate challenging situations. We also engage in community advocacy efforts to ensure the concerns and needs of our community are represented in broader discussions."
  },
  {
    id: "nikah",
    title: "Nikah Services",
    description: "Marriage services including counseling, documentation and ceremonies.",
    icon: "Heart",
    color: "bg-red-50 text-red-700",
    details: [
      "Pre-marital counseling",
      "Nikah (Islamic marriage) ceremony",
      "Marriage certificate issuance",
      "Marriage preparation courses",
      "Family counseling",
      "Marital dispute resolution"
    ],
    fullDescription: "Our Nikah Services provide comprehensive support for couples seeking to marry in accordance with Islamic traditions. We offer pre-marital counseling, conduct nikah ceremonies, issue marriage certificates, and provide ongoing support for newly married couples. Our services also include marriage preparation courses and resources for building strong, healthy family relationships."
  },
  {
    id: "funeral",
    title: "Funeral Support",
    description: "Assistance with funeral arrangements and support during difficult times.",
    icon: "HandHeart",
    color: "bg-gray-50 text-gray-700",
    details: [
      "Janazah (funeral) arrangements",
      "Ghusl (washing) services",
      "Burial coordination",
      "Cemetery arrangements",
      "Grief counseling",
      "Estate planning guidance"
    ],
    fullDescription: "Our Funeral Support service provides compassionate assistance to families during times of loss. We help with all aspects of Islamic funeral arrangements, including ghusl services, janazah prayers, and burial coordination. We also offer grief counseling and support for families adjusting to life after losing a loved one, as well as guidance on estate planning and other practical matters."
  },
  {
    id: "new-muslim",
    title: "New Muslim Service",
    description: "Support and education for new Muslims and those interested in Islam.",
    icon: "BookText",
    color: "bg-teal-50 text-teal-700",
    details: [
      "Shahada (conversion) services",
      "Basic Islamic teachings",
      "Mentorship programs",
      "Community integration",
      "Educational resources",
      "Support groups"
    ],
    fullDescription: "Our New Muslim Service provides support and resources for individuals who have recently embraced Islam or are interested in learning more about the faith. We offer shahada services, basic Islamic teachings, mentorship programs, and community integration support. Our welcoming environment helps new Muslims navigate their spiritual journey with confidence and connection."
  },
  {
    id: "special-needs",
    title: "Special Needs Services",
    description: "Specialized programs and support for individuals with special needs.",
    icon: "HandHeart",
    color: "bg-cyan-50 text-cyan-700",
    details: [
      "Specialized education programs",
      "Support groups for families",
      "Accessibility services",
      "Recreational activities",
      "Resource referrals",
      "Respite care coordination"
    ],
    fullDescription: "Our Special Needs Services provide tailored support for individuals with diverse abilities and their families. We offer specialized education programs, recreational activities, accessibility services, and family support groups. Our goal is to create an inclusive environment where everyone can participate fully in community life and access the resources they need to thrive."
  },
  {
    id: "matrimony",
    title: "Matrimony Services",
    description: "Matchmaking services for Muslims seeking marriage partners.",
    icon: "Heart",
    color: "bg-pink-50 text-pink-700",
    details: [
      "Matrimonial database",
      "Supervised introductions",
      "Background verification",
      "Pre-marital counseling",
      "Matrimonial events",
      "Online matching platform"
    ],
    fullDescription: "Our Matrimony Services help Muslim individuals find compatible marriage partners in a respectful, Islamic environment. We maintain a confidential matrimonial database, facilitate supervised introductions, and organize matrimonial events. Our service includes background verification, pre-marital counseling, and ongoing support for couples throughout the matchmaking process."
  },
  {
    id: "facilities",
    title: "Facilities Services",
    description: "Venue spaces for community events, classes, and private functions.",
    icon: "Building",
    color: "bg-indigo-50 text-indigo-700",
    details: [
      "Event hall rentals",
      "Classroom spaces",
      "Conference rooms",
      "Sports facilities",
      "Kitchen and dining areas",
      "Audio-visual equipment"
    ],
    fullDescription: "Our Facilities Services offer a variety of spaces for community events, educational programs, and private functions. We have event halls, classrooms, conference rooms, and recreational spaces available for rental. All our facilities are well-maintained and equipped with modern amenities, including audio-visual equipment, to ensure successful events and activities."
  }
];

// (removed unused dynamic icon import)

// Post card is now a shared component at src/components/ServicePostCard.tsx

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const service = services.find(s => s.id === id);

  const [posts, setPosts] = useState<ServicePost[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!service) return;
        const data = await servicePostService.getPostsByService(service.id);
        setPosts(data || []);
      } catch (err) {
        console.error('Failed to load service posts', err);
      }
    };
    load();
  }, [service]);
  // Guard: if service not found, show a friendly message
  if (!service) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 md:px-6 py-12">
          <h2 className="text-2xl font-display font-medium mb-4">Service not found</h2>
          <p className="text-muted-foreground mb-6">The requested service could not be found.</p>
          <Button asChild>
            <Link to="/services">View Services</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
              <h2 className="text-2xl font-display font-medium mb-4">About This Service</h2>
              <p className="text-muted-foreground mb-8">
                {service.fullDescription}
              </p>
              
              <h3 className="text-lg font-medium mb-4">Services Provided:</h3>
              <ul className="space-y-2 mb-6">
                {service.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link to={`/contact?service=${service.id}`}>
                    Request This Service
                  </Link>
                </Button>
              </div>

              {/* Service posts (created by admin) */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h2 className="text-2xl font-display font-medium mb-4">Latest Posts</h2>
                <div>
                  {posts.length === 0 ? (
                    <div className="text-muted-foreground">No posts for this service yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.map(p => (
                        <ServicePostCard key={p._id} post={p as any} serviceId={service?.id} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          <div className="space-y-6">
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
              <h3 className="font-medium text-lg mb-4">Related Services</h3>
              <ul className="space-y-2">
                {services
                  .filter(s => s.id !== service.id)
                  .slice(0, 3)
                  .map(relatedService => (
                    <li key={relatedService.id}>
                      <Link 
                        to={`/services/${relatedService.id}`}
                        className="text-primary flex items-center hover:underline py-1"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {relatedService.title}
                      </Link>
                    </li>
                  ))
                }
                <li>
                  <Link 
                    to="/services"
                    className="text-muted-foreground flex items-center hover:underline mt-2 pt-2 border-t"
                  >
                    View All Services
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Need More Information?</h2>
            <p className="text-muted-foreground mb-8">
              If you have questions about this service or would like to learn more about how we can help,
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/services">Explore Other Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceDetail;


import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Users, Heart, ArrowRight } from "lucide-react";

const teamMembers = [
  {
    name: "Imam Abdullah",
    role: "Center Director",
    bio: "Imam Abdullah has over 20 years of experience in community leadership and Islamic education. He holds degrees in Islamic Studies and Comparative Religion.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Dr. Sarah Ahmed",
    role: "Education Director",
    bio: "Dr. Sarah supervises all educational programs at the center. With a PhD in Education and background in Islamic Studies, she brings academic excellence to our programs.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Brother Yousef",
    role: "Youth Programs Coordinator",
    bio: "Brother Yousef leads our dynamic youth programs. With his background in counseling and youth development, he creates engaging activities for our younger community members.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Sister Aisha",
    role: "Community Outreach Director",
    bio: "Sister Aisha manages our community relations and outreach programs. Her passion for community service drives our engagement with the broader community.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Dr. Khalid Rahman",
    role: "Medical Services Coordinator",
    bio: "Dr. Khalid oversees our medical clinic services. With his medical expertise, he ensures quality healthcare services for our community members.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Sister Fatima",
    role: "Social Services Manager",
    bio: "Sister Fatima coordinates our social services and welfare programs. Her background in social work guides our approach to supporting community needs.",
    image: "https://images.unsplash.com/photo-1525288061047-8485ed7f2c2a?auto=format&fit=crop&w=300&q=80"
  },
];

const milestones = [
  {
    year: "1990",
    title: "Founding of the Center",
    description: "The Urbania Welfare Community Center was established by a group of dedicated community members to address the growing needs of the Muslim community in Boston."
  },
  {
    year: "1995",
    title: "Opening of the First Building",
    description: "After five years of fundraising and planning, the center opened its first dedicated building, providing a permanent home for our services and programs."
  },
  {
    year: "2000",
    title: "Launch of Educational Programs",
    description: "We expanded our services to include structured educational programs, including weekend school for children and adult education classes."
  },
  {
    year: "2005",
    title: "Community Health Initiative",
    description: "The center established its first medical clinic, providing free or low-cost health services to community members in need."
  },
  {
    year: "2010",
    title: "Youth Center Development",
    description: "A dedicated youth center was created to provide a safe and enriching environment for young Muslims to gather, learn, and develop leadership skills."
  },
  {
    year: "2015",
    title: "Expansion of Welfare Services",
    description: "Our welfare services were expanded to include comprehensive support for newcomers, emergency financial assistance, and food distribution programs."
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "In response to the global pandemic, the center accelerated its digital transformation, offering online classes, virtual events, and expanded outreach."
  },
  {
    year: "2023",
    title: "Current Growth and Development",
    description: "Today, the center continues to grow, with ongoing construction of additional facilities and the development of new programs to serve our community."
  },
];

const About = () => {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              About Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn about our mission, vision, history, and the dedicated team behind Urbania Welfare Community Center.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-display font-medium mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              The Urbania Welfare Community Centre is committed to supporting and uplifting the community by providing essential welfare services, educational programs, and volunteering opportunities. We strive to foster a sense of belonging, mutual support, and spiritual growth.
            </p>
            <p className="text-muted-foreground mb-6">
              Our center serves as an accessible platform for sharing information, accepting donations, recruiting volunteers, and connecting with the community. We believe in serving with compassion, fostering inclusivity, and making a positive impact in the lives of those we serve.
            </p>
            <div className="font-medium text-lg italic text-primary border-l-4 border-primary pl-4 mb-6">
              "Serving our community with compassion, knowledge, and dedication."
            </div>
            <Button asChild>
              <Link to="/services">Explore Our Services</Link>
            </Button>
          </div>
          <div className="bg-primary/5 p-8 rounded-xl shadow-sm border">
            <h3 className="text-xl font-medium mb-4">Our Core Values</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Compassion</h4>
                  <p className="text-sm text-muted-foreground">Serving with kindness and empathy toward all community members.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Inclusivity</h4>
                  <p className="text-sm text-muted-foreground">Creating a welcoming environment for people of all backgrounds.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Dedication</h4>
                  <p className="text-sm text-muted-foreground">Commitment to excellence in all our programs and services.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Sustainability</h4>
                  <p className="text-sm text-muted-foreground">Building long-term solutions for community well-being.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-16" />
        
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-medium mb-4">Our History</h2>
            <p className="text-muted-foreground">
              For over three decades, the Urbania Welfare Community Center has been serving the community. 
              Explore our journey and key milestones over the years.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-start ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="hidden md:block w-1/2"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center z-10">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-full md:w-1/2 rounded-xl p-6 bg-card border shadow-sm ml-12 md:ml-0 md:mr-0 relative">
                    <div className="absolute top-6 -left-8 md:static md:mb-2 w-16 h-16 md:w-auto md:h-auto bg-primary/10 md:bg-transparent rounded-lg flex items-center justify-center text-primary font-display font-medium">
                      {milestone.year}
                    </div>
                    <div className="md:pl-0">
                      <h3 className="text-xl font-medium mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-16" />
        
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-medium mb-4">Our Team</h2>
            <p className="text-muted-foreground">
              Meet the dedicated individuals who lead our various programs and initiatives. 
              Our team brings diverse expertise and shared commitment to serving the community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-card rounded-xl border shadow-sm overflow-hidden hover-scale">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-16" />
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-2xl font-display font-medium mb-4">Visits & Tours</h2>
            <p className="text-muted-foreground mb-6">
              We welcome individuals and groups interested in learning more about our center, 
              services, and programs. Schedule a visit to tour our facilities and meet with our team.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium">Tour Schedule</h4>
                  <p className="text-sm text-muted-foreground">Tuesdays and Thursdays, 10:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium">Starting Point</h4>
                  <p className="text-sm text-muted-foreground">Main Reception Area, First Floor</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium">Group Size</h4>
                  <p className="text-sm text-muted-foreground">Up to 15 people per tour</p>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link to="/contact?subject=Tour%20Request">Schedule a Tour</Link>
            </Button>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-2xl font-display font-medium mb-4">Partnership Opportunities</h2>
            <p className="text-muted-foreground mb-6">
              We collaborate with organizations, businesses, and institutions that share our 
              commitment to community welfare and development. Explore partnership possibilities with us.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium">Community Programs</h4>
                <p className="text-sm text-muted-foreground">Joint initiatives addressing specific community needs</p>
              </div>
              <div>
                <h4 className="font-medium">Educational Collaborations</h4>
                <p className="text-sm text-muted-foreground">Partnerships with schools, colleges, and educational institutions</p>
              </div>
              <div>
                <h4 className="font-medium">Corporate Social Responsibility</h4>
                <p className="text-sm text-muted-foreground">Engagement opportunities for businesses looking to make social impact</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/contact?subject=Partnership%20Inquiry">Discuss Partnership</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-8">
              There are many ways to get involved with our center - attend our events, volunteer for our programs, 
              or support our initiatives through donations. We welcome you to be part of our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/volunteering">Volunteer With Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

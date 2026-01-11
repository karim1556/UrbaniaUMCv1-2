import React, { useEffect } from "react";
import Hero from "../components/home/Hero";
import UpcomingEvents from "../components/home/UpcomingEvents";
import Services from "../components/home/Services";
import VolunteerSection from "../components/home/VolunteerSection";
import Donate from "../components/home/Donate";
import PrayerTimes from "../components/home/PrayerTimes";
import MainLayout from "../components/layout/MainLayout";
import { Separator } from "../components/ui/separator";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="pt-20">
        <Hero />
      </div>
      
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-card border border-border/50 rounded-xl p-6 h-full">
                <h3 className="text-xl font-medium mb-4">About Urbania Welfare Community Center</h3>
                <p className="text-muted-foreground mb-4">
                  The Urbania Welfare Community Centre is committed to supporting and uplifting 
                  the community by providing essential welfare services, educational programs, 
                  and volunteering opportunities.
                </p>
                <p className="text-muted-foreground">
                  Our center serves as an accessible platform for sharing information, accepting 
                  donations, recruiting volunteers, and connecting with the community. We strive 
                  to make a positive impact in the lives of those we serve.
                </p>
              </div>
            </div>
            <div>
              <PrayerTimes />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      <UpcomingEvents />
      
      <Separator />
      <Services />
      
      <VolunteerSection />
      
      <Donate />
    </MainLayout>
  );
};

export default Index;

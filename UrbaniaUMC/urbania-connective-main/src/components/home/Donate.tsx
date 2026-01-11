
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Donate = () => {
  return (
    <section className="py-16 section-fade-in">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-primary text-primary-foreground rounded-2xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-8 md:p-12">
              <div className="max-w-xl">
                <div className="flex items-center mb-6">
                  <Heart className="h-8 w-8 mr-3 text-white" fill="white" />
                  <h2 className="text-3xl md:text-4xl font-display font-medium">Make a Donation</h2>
                </div>
                <p className="text-primary-foreground/90 text-lg mb-8">
                  Your generous donations help us continue our mission of serving the community. 
                  Every contribution, no matter the size, makes a significant impact on our programs 
                  and the lives of those we serve.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 text-center">
                    <p className="text-lg font-medium">$50</p>
                    <p className="text-xs text-primary-foreground/70">Monthly Food Support</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 text-center">
                    <p className="text-lg font-medium">$100</p>
                    <p className="text-xs text-primary-foreground/70">Education Materials</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 text-center">
                    <p className="text-lg font-medium">$250</p>
                    <p className="text-xs text-primary-foreground/70">Medical Assistance</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-4 text-center">
                    <p className="text-lg font-medium">Custom</p>
                    <p className="text-xs text-primary-foreground/70">Choose Amount</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="gap-2 group bg-white hover:bg-white/90 text-primary"
                  asChild
                >
                  <Link to="/donate">
                    Donate Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-2 relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1000&auto=format&fit=crop" 
                alt="People helping in community" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donate;

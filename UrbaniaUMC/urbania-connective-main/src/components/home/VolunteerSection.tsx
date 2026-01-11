
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const VolunteerSection = () => {
  return (
    <section className="py-20 bg-primary/5 overflow-hidden relative section-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1469571486292-b53601021a68?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-tight mb-6">
            Make a Difference <br />
            <span className="text-primary">By Volunteering</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Volunteering is at the heart of our community center. Join our team of dedicated volunteers
            and help us create positive change. We have opportunities for everyone, regardless of your skills or availability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <div className="bg-background border border-border/40 rounded-xl p-6 hover-scale">
              <h3 className="text-xl font-medium mb-3">Feed the Hungry</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Help prepare and distribute food to those in need through our food bank and meal programs.
              </p>
              <Link to="/volunteering" className="text-primary font-medium text-sm inline-flex items-center hover:underline">
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-background border border-border/40 rounded-xl p-6 hover-scale">
              <h3 className="text-xl font-medium mb-3">Educate Children</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Volunteer as a tutor or instructor for our after-school programs and educational workshops.
              </p>
              <Link to="/volunteering" className="text-primary font-medium text-sm inline-flex items-center hover:underline">
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-background border border-border/40 rounded-xl p-6 hover-scale">
              <h3 className="text-xl font-medium mb-3">Shelter the Homeless</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Support our initiatives to provide temporary shelter and housing assistance to those in need.
              </p>
              <Link to="/volunteering" className="text-primary font-medium text-sm inline-flex items-center hover:underline">
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-background border border-border/40 rounded-xl p-6 hover-scale">
              <h3 className="text-xl font-medium mb-3">Comfort the Sick</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Provide support to patients and families through our medical outreach and hospital visitation programs.
              </p>
              <Link to="/volunteering" className="text-primary font-medium text-sm inline-flex items-center hover:underline">
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <Button size="lg" asChild>
            <Link to="/volunteering" className="gap-2 group">
              Become a Volunteer
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;

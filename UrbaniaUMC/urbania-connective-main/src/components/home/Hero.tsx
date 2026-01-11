import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { eventService, Event } from "@/services/eventService";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await eventService.getAllEvents();
        const eventsWithImages = fetchedEvents.filter(e => e.image);
        setEvents(eventsWithImages.slice(0, 5)); // Limit to 5 images
      } catch (err) {
        setError("Failed to load event images.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay: automatically advance the slide every 4 seconds
  useEffect(() => {
    if (!emblaApi) return;
    let autoplay = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    }, 4000);
    // Reset autoplay if user interacts
    emblaApi.on('select', () => {
      clearInterval(autoplay);
      autoplay = setInterval(() => {
        if (emblaApi) {
          emblaApi.scrollNext();
        }
      }, 4000);
    });
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const hasImages = !loading && !error && events.length > 0;

  return (
    <div className="relative overflow-hidden pb-16 md:pb-20 text-white h-[600px] md:h-[700px]">
      {hasImages ? (
        <div className="absolute inset-0" ref={emblaRef}>
          <div className="flex h-full">
            {events.map((event) => (
              <div key={event._id} className="relative flex-[0_0_100%] h-full">
                <img
                  src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-sand-50 to-transparent">
          <div className="absolute top-0 left-0 right-0 h-[500px] mask-radial-faded bg-gradient-to-r from-emerald-50/40 via-teal-50/10 to-emerald-50/40 opacity-60"></div>
          <div className="absolute w-20 h-20 rounded-full bg-emerald-100/40 top-1/3 left-1/4 blur-3xl"></div>
          <div className="absolute w-32 h-32 rounded-full bg-teal-100/40 bottom-1/4 right-1/3 blur-3xl"></div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium bg-white/10 text-white rounded-full">
            Serving Our Community
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6 animate-fade-in text-shadow">
            Building a <span className="text-emerald-300">Stronger</span> Community Together
          </h1>
          <p className="text-lg md:text-xl text-sand-200 mb-8 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms] text-shadow-sm">
            The Urbania Welfare Community Centre is committed to supporting and uplifting our community through essential services, education, and volunteering opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in [animation-delay:400ms]">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/services" className="gap-2 group px-6">
                Our Services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white/10">
              <Link to="/volunteering">Volunteer With Us</Link>
            </Button>
          </div>
        </div>
      </div>

      {hasImages && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                selectedIndex === index ? "w-6 bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;

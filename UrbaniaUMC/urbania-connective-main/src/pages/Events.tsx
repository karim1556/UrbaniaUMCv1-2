import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { eventService, Event } from "@/services/eventService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  // Add logic to check if the event is in the past
  const isPastEvent = new Date(event.date) < new Date();
  return (
    <Card className="overflow-hidden hover-scale">
      <div className="h-48 overflow-hidden">
        <img
          src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
          <span className={cn(
            "inline-block px-2 py-1 text-xs font-medium rounded-full",
            event.pricing.type === "free"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          )}>
            {event.pricing.type === "free"
              ? "Free"
              : `₹${event.pricing.amount}`}
          </span>
        </div>
        <h3 className="text-xl font-medium mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span>
              {typeof event.time === 'object'
                ? `${event.time.startTime} to ${event.time.endTime}`
                : event.time}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
          {event.registration.required && event.registration.deadline && (
            <div className="flex items-center text-xs">
              <span className="text-yellow-600">
                Registration deadline: {event.registration.deadline}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <Link to={`/events/${event._id}`} className="text-primary font-medium text-sm inline-flex items-center hover:underline">
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          {event.registration.capacity && (
            <span className="text-xs text-muted-foreground">
              Capacity: {event.registration.capacity}
            </span>
          )}
          {/* Only show registration button for upcoming events */}
          {!isPastEvent && event.registration.required && (
            <Link to={`/events/${event._id}/eventregistrationform`}>
              <Button size="sm">Register</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PastEventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span>
              {typeof event.time === 'object'
                ? `${event.time.startTime} to ${event.time.endTime}`
                : event.time}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Link to={`/events/${event._id}`} className="text-primary font-medium text-sm inline-flex items-center hover:underline">
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          {event.registration?.capacity && (
            <span className="text-xs text-muted-foreground">
              Capacity: {event.registration.capacity}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events...');
      const response = await eventService.getAllEvents();
      console.log('Fetched events:', response);
      setEvents(response);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on category
  const filteredEvents = Array.isArray(events)
    ? (categoryFilter === "all" ? events : events.filter(event => event.category === categoryFilter))
    : [];

  // Separate past and upcoming events
  const now = new Date();
  const pastEvents = filteredEvents.filter(event => {
    try {
      const eventDate = new Date(event.date);
      return eventDate < now;
    } catch (error) {
      console.error('Error parsing date for event:', event, error);
      return false;
    }
  });

  const upcomingEvents = filteredEvents.filter(event => {
    try {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    } catch (error) {
      console.error('Error parsing date for event:', event, error);
      return false;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Events Found</h2>
          <p className="text-gray-600">There are no events available at the moment. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-sand-50 to-transparent py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">
              Events & Activities
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our upcoming and past events. Join us in building a stronger, more connected community through various activities and programs.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            {activeTab === "upcoming" && (
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={categoryFilter === "community" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("community")}
                >
                  Community
                </Button>
                <Button
                  variant={categoryFilter === "education" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("education")}
                >
                  Education
                </Button>
                <Button
                  variant={categoryFilter === "charity" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("charity")}
                >
                  Charity
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="upcoming">
            <div className="space-y-12">
              {upcomingEvents.filter(event => event.featured).length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-medium mb-6">Featured Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.filter(event => event.featured).map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-display font-medium mb-6">All Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div>
              <h2 className="text-2xl font-display font-medium mb-6">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <PastEventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-medium mb-4">Want to Host an Event?</h2>
            <p className="text-muted-foreground mb-8">
              If you're interested in hosting an event at our facility or partnering with us for community activities,
              we'd love to hear from you. Our spaces are available for various functions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/services/facilities">View Our Facilities</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Events;

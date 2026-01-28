import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { eventService, Event } from "@/services/eventService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={event.pricing.type === "free" ? "secondary" : "default"}>
              {event.pricing.type === "free"
                ? "Free"
                : `₹${Number(event.pricing.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            </Badge>
          {event.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
          {event.registration.required && event.registration.deadline && (
            <span className="text-xs text-yellow-600">
              Register by {event.registration.deadline}
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
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
        <div className="flex items-center justify-between">
          <Link
            to={`/events/${event._id}`}
            className="text-primary font-medium inline-flex items-center hover:underline"
          >
            View Details
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          {event.registration.capacity && (
            <span className="text-xs text-muted-foreground">
              {event.registration.capacity} spots
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingEvents = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events for home page...');
      const response = await eventService.getAllEvents();
      console.log('Fetched events for home page:', response);
      setEvents(response);
    } catch (error) {
      console.error('Error fetching events for home page:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on category and get upcoming events only
  const now = new Date();
  const upcomingEvents = events.filter(event => {
    try {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    } catch (error) {
      console.error('Error parsing date for event:', event, error);
      return false;
    }
  });

  const filteredEvents = categoryFilter === "all"
    ? upcomingEvents
    : upcomingEvents.filter(event => event.category === categoryFilter);

  if (loading) {
    return (
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for these upcoming events and be part of our growing community.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for these upcoming events and be part of our growing community.
            </p>
          </div>
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us for these upcoming events and be part of our growing community.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            <Button asChild className="mt-4">
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join us for these upcoming events and be part of our growing community. From educational workshops to charity drives, there's something for everyone.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
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
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.slice(0, 6).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;

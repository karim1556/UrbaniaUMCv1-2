import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, ArrowRight, Users, Share2, Calendar as CalendarIcon, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { eventService, Event } from "@/services/eventService";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add state for selected image index
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Arrow navigation handlers
  const handlePrevImage = () => {
    if (!event?.images) return;
    setSelectedImageIdx((prev) => (prev - 1 + event.images.length) % event.images.length);
  };
  const handleNextImage = () => {
    if (!event?.images) return;
    setSelectedImageIdx((prev) => (prev + 1) % event.images.length);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await eventService.getEventById(id as string);
        setEvent(eventData);

        // Fetch related events (same category)
        const allEvents = await eventService.getAllEvents();
        const related = allEvents
          .filter(e => e.category === eventData.category && e._id !== eventData._id)
          .slice(0, 3);
        setRelatedEvents(related);
      } catch (err) {
        setError("Failed to load event details. Please try again later.");
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10 text-center" style={{ marginTop: "100px" }}>
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error || "The event you are looking for does not exist."}
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Add logic to check if the event is in the past
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6 mt-24"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="rounded-lg overflow-hidden mb-6">
              {Array.isArray(event.images) && event.images.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full flex justify-center items-center" style={{ minHeight: 320 }}>
                    <div
                      className="relative flex items-center justify-center bg-white rounded-lg shadow-lg"
                      style={{ width: 600, height: 400, maxWidth: '100%' }}
                    >
                      <img
                        src={event.images?.[selectedImageIdx]}
                        alt={`${event.title} image ${selectedImageIdx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    {event.images && event.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow p-2 rounded-full z-10 border border-gray-200"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow p-2 rounded-full z-10 border border-gray-200"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 justify-center flex-wrap">
                    {event.images?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${event.title} thumbnail ${idx + 1}`}
                        className={
                          `h-16 w-24 object-cover rounded cursor-pointer border-2 transition-all duration-200 bg-white ` +
                          (selectedImageIdx === idx ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-primary')
                        }
                        style={{ boxShadow: selectedImageIdx === idx ? '0 0 0 2px #2563eb' : undefined }}
                        onClick={() => setSelectedImageIdx(idx)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[400px] object-cover"
                />
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                  <Badge variant={event.pricing.type === "free" ? "secondary" : "default"}>
                    {event.pricing.type === "free" ? "Free Event" : `Paid Event - ₹${event.pricing.amount}`}
                  </Badge>
                  {event.featured && (
                    <Badge variant="secondary">Featured Event</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-6">{event.description}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="grid gap-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">
                        {typeof event.time === 'object'
                          ? `${event.time.startTime} to ${event.time.endTime}`
                          : event.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  {event.organizerName && (
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Organized By</p>
                        <p className="text-muted-foreground">{event.organizerName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {event.fullDescription && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="prose prose-sm max-w-none">
                      <ul className="space-y-3">
                        {event.fullDescription.split('\n').map((line, index) => (
                          line.trim() && (
                            <li key={index} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              <span className="text-muted-foreground leading-relaxed break-words break-all whitespace-normal max-w-full">{line}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Pricing Information</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-lg">
                          {event.pricing.type === "free" ? "Free Event" : `₹${event.pricing.amount}`}
                        </p>
                        <p className="text-muted-foreground">{event.pricing.details}</p>
                      </div>
                      {event.pricing.type === "paid" && (
                              isPastEvent ? (
                                <Button className="w-full" disabled>
                                  Registration Closed
                                </Button>
                              ) : (
                                <Link to={`/events/${event._id}/eventregistrationform`} style={{ width: '100%' }}>
                                  <Button className="w-full" disabled={(event.registration.capacity - (event.attendees || 0)) <= 0}>
                                    {(event.registration.capacity - (event.attendees || 0)) <= 0 ? 'Event Full' : 'Register Now'}
                                  </Button>
                                </Link>
                              )
                            )}
                    </div>
                    {event.registration.required && (
                      <Alert>
                        <AlertTitle className="flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          Registration Required
                        </AlertTitle>
                        <AlertDescription>
                          <p>Please register before {event.registration.deadline}</p>
                          <p className="mt-2">Available Spots: {Math.max(0, event.registration.capacity - (event.attendees || 0))} / {event.registration.capacity}</p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Registration Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.registration.required
                        ? `Registration required by ${event.registration.deadline}`
                        : "No registration required"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Capacity</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.registration.capacity} attendees
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Cost</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.pricing.type === "free"
                        ? "This is a free event"
                        : `₹${event.pricing.amount} - ${event.pricing.details}`}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {event.registration.required && (
                  isPastEvent ? (
                    <Button className="w-full" disabled>
                      Registration Closed
                    </Button>
                  ) : (
                    <Link to={`/events/${event._id}/eventregistrationform`} style={{ width: '100%' }}>
                      <Button className="w-full" disabled={(event.registration.capacity - (event.attendees || 0)) <= 0}>
                        {(event.registration.capacity - (event.attendees || 0)) <= 0 ? 'Event Full' : 'Register for Event'}
                      </Button>
                    </Link>
                  )
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Separator />

      {relatedEvents.length > 0 && (
        <div className="bg-primary/5 py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold mb-8">Related Events</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedEvents.map((relatedEvent) => (
                <Card key={relatedEvent._id}>
                  <CardHeader>
                    <CardTitle>{relatedEvent.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{relatedEvent.date}</p>
                    <p className="mt-2">{relatedEvent.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/events/${relatedEvent._id}`}>
                      <Button variant="link" className="text-primary">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default EventDetail;

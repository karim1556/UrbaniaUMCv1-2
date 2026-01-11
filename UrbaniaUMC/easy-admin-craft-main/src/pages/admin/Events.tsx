import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { eventService, Event } from "@/services/event.service";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch events with optimized query
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAllEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    }
  });

  // Filter events
  let filteredEvents = eventsData?.events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;

    const now = new Date();
    const eventDate = new Date(event.date);

    let matchesTime = true;
    if (timeFilter === "upcoming") {
      matchesTime = eventDate >= now;
    } else if (timeFilter === "past") {
      matchesTime = eventDate < now;
    } // 'all' shows all events

    return matchesSearch && matchesCategory && matchesTime;
  }) || [];

  // Sort events: if 'all', upcoming first (by date asc), then past (by date asc)
  if (timeFilter === 'all') {
    const now = new Date();
    const upcoming = filteredEvents.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = filteredEvents.filter(e => new Date(e.date) < now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    filteredEvents = [...upcoming, ...past];
  }

  // Fetch total attendees for all filtered events
  const totalAttendeesQueries = useQueries({
    queries: filteredEvents.map(event => ({
      queryKey: ['totalAttendees', event._id],
      queryFn: () => eventService.getTotalAttendees(event._id),
      staleTime: 1000 * 60 * 5,
    }))
  });

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.deleteEvent(event._id);
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  // Add a handler for viewing attendees
  const handleViewAttendees = (event: Event) => {
    navigate(`/admin/events/${event._id}/attendees`);
  };

  if (showForm || editingEvent) {
    return (
      <div className="container mx-auto py-8">
        <EventForm
          event={editingEvent || undefined}
          onCancel={handleFormClose}
          onSuccess={handleFormClose}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Events Management</CardTitle>
              <CardDescription>
                Create, manage, and monitor all community events.
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(value: string) => setCategoryFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={(value: 'all' | 'upcoming' | 'past') => setTimeFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All, Upcoming or Past" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Events</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center p-8">Loading events...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event: Event, idx: number) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    attendeeCount={typeof totalAttendeesQueries[idx]?.data === 'number' && !isNaN(totalAttendeesQueries[idx]?.data) ? totalAttendeesQueries[idx]?.data : 0}
                    onDelete={handleDeleteEvent}
                    onEdit={handleEditEvent}
                    onViewAttendees={() => handleViewAttendees(event)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center p-8 text-muted-foreground bg-muted/20 rounded-lg">
                  No events found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsPage;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/services/event.service";
import { format } from 'date-fns';

interface EventCardProps {
    event: Event;
    attendeeCount?: number;
    onDelete?: (event: Event) => void;
    onEdit?: (event: Event) => void;
    onViewAttendees?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, attendeeCount = 0, onDelete, onEdit, onViewAttendees }) => {
    const isUpcoming = new Date(event.date) > new Date();

    // Format time display
    const formatTime = (time: string | { startTime: string; endTime: string }) => {
        if (typeof time === 'string') {
            return time;
        }
        return `${time.startTime} to ${time.endTime}`;
    };

    return (
        <Card className="overflow-hidden">
            {/* Event Image */}
            <div className="relative h-48 w-full">
                <img
                    src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                {event.featured && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                        Featured
                    </Badge>
                )}
            </div>

            <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span>{formatTime(event.time)}</span>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-muted-foreground">{event.location}</p>
                        </div>
                        <div>
                            <span className="font-medium">Category:</span>
                            <p className="text-muted-foreground capitalize">{event.category}</p>
                        </div>
                        <div>
                            <span className="font-medium">Price:</span>
                            <p className="text-muted-foreground">
                                {event.pricing.type === 'free' ? 'Free' : `₹${Math.round(Number(event.pricing.amount))}`}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Capacity:</span>
                            <p className="text-muted-foreground">{event.registration.capacity} spots</p>
                        </div>
                        <div>
                            <span className="font-medium">Organizer:</span>
                            <p className="text-muted-foreground">{event.organizerName}</p>
                        </div>
                        <div>
                            <span className="font-medium">Attendees:</span>
                            <p className="text-muted-foreground">{attendeeCount}</p>
                        </div>
                    </div>

                    {/* Additional Details */}
                    {event.additionalDetails && event.additionalDetails.length > 0 && (
                        <div>
                            <span className="font-medium text-sm">Additional Details:</span>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {event.additionalDetails.map((detail, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                        <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "Upcoming" : "Past"}
                        </Badge>
                        <div className="flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(event)}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(event)}
                                    className="text-sm text-destructive hover:underline"
                                >
                                    Delete
                                </button>
                            )}
                            {onViewAttendees && (
                                <button
                                    onClick={onViewAttendees}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View Attendees
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EventCard; 
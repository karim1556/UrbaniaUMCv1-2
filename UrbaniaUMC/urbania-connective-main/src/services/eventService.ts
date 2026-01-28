import api from '@/lib/axios';

export interface Event {
    _id: string;
    title: string;
    date: string;
    time: string | {
        startTime: string;
        endTime: string;
    };
    location: string;
    category: string;
    description: string;
    fullDescription?: string;
    image: string;
    images?: string[]; // Added images array
    featured: boolean;
    organizer?: string;
    organizerName?: string;
    attendees?: number;
    additionalDetails?: string[];
    pricing: {
        type: 'free' | 'paid';
        amount: number;
        details: string;
    };
    registration: {
        required: boolean;
        deadline?: string;
        capacity?: number;
    };
    status?: 'upcoming' | 'past';
}

interface EventsResponse {
    events: Event[];
    totalPages: number;
    currentPage: number;
}

export const eventService = {
    // Get all events
    getAllEvents: async (): Promise<Event[]> => {
            const response = await api.get<EventsResponse>('/events');
            console.log('API Response:', response.data);
            // Normalize pricing.amount to a number and strip any currency symbols
            const events = response.data.events || [];
            return events.map((ev: Event) => {
                try {
                    const amt = (ev.pricing && (ev.pricing as any).amount);
                    if (typeof amt === 'string') {
                        const cleaned = amt.replace(/[^0-9.\-]/g, '');
                        (ev.pricing as any).amount = cleaned === '' ? 0 : parseFloat(cleaned);
                    }
                } catch (err) {
                    // ignore
                }
                return ev;
            });
    },

    // Get featured events
    getFeaturedEvents: async (): Promise<Event[]> => {
        const response = await api.get('/events/featured');
        const events = response.data || [];
        return events.map((ev: Event) => {
            try {
                const amt = (ev.pricing && (ev.pricing as any).amount);
                if (typeof amt === 'string') {
                    const cleaned = amt.replace(/[^0-9.\-]/g, '');
                    (ev.pricing as any).amount = cleaned === '' ? 0 : parseFloat(cleaned);
                }
            } catch (err) {}
            return ev;
        });
    },

    // Get upcoming events
    getUpcomingEvents: async (): Promise<Event[]> => {
        const response = await api.get('/events/upcoming');
        const events = response.data || [];
        return events.map((ev: Event) => {
            try {
                const amt = (ev.pricing && (ev.pricing as any).amount);
                if (typeof amt === 'string') {
                    const cleaned = amt.replace(/[^0-9.\-]/g, '');
                    (ev.pricing as any).amount = cleaned === '' ? 0 : parseFloat(cleaned);
                }
            } catch (err) {}
            return ev;
        });
    },

    // Get events by category
    getEventsByCategory: async (category: string): Promise<Event[]> => {
        const response = await api.get(`/events/category/${category}`);
        const events = response.data || [];
        return events.map((ev: Event) => {
            try {
                const amt = (ev.pricing && (ev.pricing as any).amount);
                if (typeof amt === 'string') {
                    const cleaned = amt.replace(/[^0-9.\-]/g, '');
                    (ev.pricing as any).amount = cleaned === '' ? 0 : parseFloat(cleaned);
                }
            } catch (err) {}
            return ev;
        });
    },

    // Get single event by ID
    getEventById: async (id: string): Promise<Event> => {
        const response = await api.get<Event>(`/events/${id}`);
        return response.data;
    }
}; 
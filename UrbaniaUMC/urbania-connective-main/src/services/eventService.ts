import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
        const response = await axios.get<EventsResponse>(`${API_URL}/api/events`);
        console.log('API Response:', response.data);
        return response.data.events;
    },

    // Get featured events
    getFeaturedEvents: async (): Promise<Event[]> => {
        const response = await axios.get(`${API_URL}/api/events/featured`);
        return response.data;
    },

    // Get upcoming events
    getUpcomingEvents: async (): Promise<Event[]> => {
        const response = await axios.get(`${API_URL}/api/events/upcoming`);
        return response.data;
    },

    // Get events by category
    getEventsByCategory: async (category: string): Promise<Event[]> => {
        const response = await axios.get(`${API_URL}/api/events/category/${category}`);
        return response.data;
    },

    // Get single event by ID
    getEventById: async (id: string): Promise<Event> => {
        const response = await axios.get<Event>(`${API_URL}/api/events/${id}`);
        return response.data;
    }
}; 
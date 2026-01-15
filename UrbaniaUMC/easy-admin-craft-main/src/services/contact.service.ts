import apiConfig from './api.config';
import api from './api.config';

export interface Contact {
    _id: string;
    name: string;
    email: string;
    phoneno: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    readAt: string | null;
    repliedAt: string | null;
    reply: string | null;
    createdAt: string;
}

export const contactService = {
    // Get all contacts
    getAllContacts: async (): Promise<Contact[]> => {
        try {
            const response = await api.get('/api/contact/messages');
            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    },

    // Mark contact as read
    markAsRead: async (contactId: string): Promise<void> => {
        try {
            await api.patch(`/api/contact/messages/${contactId}/read`);
        } catch (error) {
            console.error('Error marking contact as read:', error);
            throw error;
        }
    },

    // Reply to contact
    replyToContact: async (contactId: string, reply: string): Promise<void> => {
        try {
            await api.post(`/api/contact/messages/${contactId}/reply`, { reply });
        } catch (error) {
            console.error('Error replying to contact:', error);
            throw error;
        }
    },

    // Get contact message counts
    getMessageCounts: async (): Promise<{ new: number; read: number; replied: number; total: number }> => {
        try {
            const response = await api.get('/api/contact/messages/counts');
            return response.data;
        } catch (error) {
            console.error('Error fetching message counts:', error);
            throw error;
        }
    },

    // Delete contact
    deleteContact: async (contactId: string): Promise<void> => {
        // Try deleting from multiple endpoints to handle backend route differences.
        const rawId = String(contactId).replace(/^(sr_|post_)/, '');
        const candidates = contactId.startsWith('sr_')
            ? [`/registrations/${rawId}`, `/contact/messages/${rawId}`, `/service-posts/${rawId}`]
            : contactId.startsWith('post_')
                ? [`/service-posts/${rawId}`, `/contact/messages/${rawId}`]
                : [`/contact/messages/${rawId}`, `/registrations/service/${rawId}`, `/service-posts/${rawId}`];

        let lastError: any = null;
        for (const ep of candidates) {
            try {
                console.debug('deleteContact: attempting DELETE', ep);
                await api.delete(ep);
                console.debug('deleteContact: deleted via', ep);
                return;
            } catch (err: any) {
                lastError = err;
                // If 404, continue to next candidate; otherwise stop and rethrow
                const status = err?.response?.status;
                console.warn(`deleteContact: failed DELETE ${ep}`, status || err?.message || err);
                if (status && status !== 404) {
                    console.error('Error deleting contact:', err);
                    throw err;
                }
                // otherwise try next candidate
            }
        }

        console.error('Error deleting contact, all endpoints failed', lastError);
        throw lastError || new Error('Failed to delete contact');
    },

    // Delete service registration (service requests endpoint)
    deleteServiceRegistration: async (registrationId: string): Promise<void> => {
        try {
            await api.delete(`/api/registrations/service/${registrationId}`);
        } catch (error) {
            console.error('Error deleting service registration:', error);
            throw error;
        }
    },

    // Create a service request (admin can add a service entry)
    createServiceRequest: async (data: any) => {
        try {
            const response = await api.post('/api/registrations/service', data);
            return response.data;
        } catch (error) {
            console.error('Error creating service request:', error);
            throw error;
        }
    },

    // Get all service requests (for admin listing)
    getAllServiceRequests: async (): Promise<any[]> => {
        try {
            const response = await api.get('/api/registrations/service');
            // API returns { serviceRequests, pagination }
            if (response.data && response.data.serviceRequests) return response.data.serviceRequests;
            return response.data;
        } catch (error) {
            console.error('Error fetching service requests:', error);
            throw error;
        }
    }
};
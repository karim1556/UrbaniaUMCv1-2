import api from './api.config';

export interface ServicePostCreate {
  serviceId: string;
  title: string;
  description: string;
  phone?: string;
  images?: string[];
  meta?: Record<string, any>;
}

export const servicePostService = {
  createPost: async (payload: ServicePostCreate) => {
    const resp = await api.post('/api/service-posts', payload);
    return resp.data;
  }
  ,
  getAllPosts: async (): Promise<any[]> => {
    const resp = await api.get('/api/service-posts');
    return resp.data;
  }
};

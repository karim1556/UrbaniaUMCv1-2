import api from '@/lib/axios';

export interface ServicePost {
  _id: string;
  serviceId: string;
  title: string;
  description: string;
  phone?: string;
  images?: string[];
  createdAt: string;
}

export const servicePostService = {
  getPostsByService: async (serviceId: string): Promise<ServicePost[]> => {
    const resp = await api.get('/service-posts', { params: { serviceId } });
    return resp.data;
  },
  getAllPosts: async (): Promise<ServicePost[]> => {
    const resp = await api.get('/service-posts');
    return resp.data;
  },
  getPostById: async (id: string): Promise<ServicePost> => {
    const resp = await api.get(`/service-posts/${id}`);
    return resp.data;
  }
};

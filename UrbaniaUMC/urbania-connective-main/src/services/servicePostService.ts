import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
    const resp = await axios.get(`${API_URL}/api/service-posts`, { params: { serviceId } });
    return resp.data;
  },
  getAllPosts: async (): Promise<ServicePost[]> => {
    const resp = await axios.get(`${API_URL}/api/service-posts`);
    return resp.data;
  },
  getPostById: async (id: string): Promise<ServicePost> => {
    const resp = await axios.get(`${API_URL}/api/service-posts/${id}`);
    return resp.data;
  }
};

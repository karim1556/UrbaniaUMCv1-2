import api from './api.config';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  organization?: string;
  customId?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  buildingName?: string;
  wing?: string;
  flatNo?: string;
  birthdate?: string;
  bio?: string;
  residenceType?: 'owner' | 'tenant';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  organization?: string;
  status?: 'pending' | 'approved' | 'rejected';
  residenceType?: 'owner' | 'tenant';
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<any>('http://localhost:3000/api/users/all');
      const payload = response.data;
      if (Array.isArray(payload)) return payload as User[];
      if (payload && Array.isArray(payload.data)) return payload.data as User[];
      return [];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`http://localhost:3000/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<User>(`http://localhost:3000/api/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`http://localhost:3000/api/users/${userId}`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  async updateProfile(data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<User>('/api/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async addUser(data: Omit<User, '_id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    const response = await api.post<User>('http://localhost:3000/api/users', data);
    return response.data;
  }

  async importUsers(file: File): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('http://localhost:3000/api/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async exportUsers(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await api.get(`http://localhost:3000/api/users/export/${format}`, { responseType: 'blob' });
    return response.data;
  }
}

export const userService = new UserService(); 
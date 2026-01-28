import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './axios';
import { authAPI, userAPI } from './api';
import { toast } from 'sonner';

// Define user type
interface User {
  _id: string;
  email: string;
  username: string;
  name?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  role: string;
  isVerified: boolean;
  customId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  buildingName?: string;
  wing?: string;
  flatNo?: string;
  birthdate?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  occupationProfile?: string;
  workplaceAddress?: string;
  gender?: 'M' | 'F';
  forumContribution?: string;
  residenceType?: 'owner' | 'tenant';
}

// Define profile update type
export type ProfileUpdate = {
  name?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  birthdate?: string;
  bio?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  buildingName?: string;
  wing?: string;
  flatNo?: string;
  occupationProfile?: string;
  workplaceAddress?: string;
  forumContribution?: string;
  gender?: 'M' | 'F';
  residenceType?: 'owner' | 'tenant';
};

// Define password update type
export type PasswordUpdate = {
  currentPassword: string;
  newPassword: string;
};



interface AuthContextType {
  user: User | null;
  displayUser?: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getInitials: (name?: string) => string;
  updateUserProfile: (profileData: ProfileUpdate) => Promise<void>;
  updateUserPassword: (passwordData: PasswordUpdate) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get user's initials from name
  const getInitials = (name?: string): string => {
    if (!name) {
      if (user?.name) {
        return `${user.name[0]}`.toUpperCase();
      }
      return '?';
    }

    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');
  };

  // Load user data on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Try to get the user profile
        const response = await userAPI.getProfile();
        setIsAuthenticated(true);
        setError(null);
        const data = response.data;
        // Backend returns a single user object (family model removed)
        setUser(data as User);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Session expired. Please login again.');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Check authentication status
  const checkAuth = async () => {
    if (!token) {
      return false;
    }

      try {
      const response = await userAPI.getProfile();
      // Only update user if the data is actually different
      const data = response.data;
      if (!user || JSON.stringify(user) !== JSON.stringify(data)) {
        setUser(data as User);
      }
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsAuthenticated(true);

      // Get user profile
      await refreshUserProfile();

      toast.success('Login successful!');

      // Handle redirect after login
      const state = location.state as { from?: string; message?: string } | null;
      const redirectTo = state?.from || '/';

      // Clear the location state and navigate
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  // Refresh user profile function
  const refreshUserProfile = async () => {
      try {
      const response = await userAPI.getProfile();
      const data = response.data;
      if (data && data.owner && data.member) {
        const owner = data.owner;
        const member = data.member;
        if (String(owner._id) === String(member._id)) {
          if (!user || JSON.stringify(user) !== JSON.stringify(owner)) {
            setUser(owner as User);
          }
        } else {
          const memberWithMeta = { ...member, isFamilyMember: true, owner: owner, memberAccount: { _id: member._id, email: member.email, customId: member.customId } } as any;
          if (!user || JSON.stringify(user) !== JSON.stringify(memberWithMeta)) {
            setUser(memberWithMeta as User);
          }
        }
      } else {
        if (!user || JSON.stringify(user) !== JSON.stringify(data)) {
          setUser(data as User);
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to refresh profile';
      console.error('Error refreshing user profile:', err);
      throw err;
    }
  };

  // Update user profile function
  const updateUserProfile = async (profileData: ProfileUpdate) => {
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(profileData);

      setUser(prev => {
        if (!prev) return null;
        return { ...prev, ...profileData };
      });

      toast.success('Profile updated successfully');

      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user password
  const updateUserPassword = async (passwordData: PasswordUpdate) => {
    try {
      await userAPI.updatePassword(passwordData);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update password';
      toast.error(message);
      throw err;
    }
  };



  const value = {
    user,
    displayUser: user && (user as any).isFamilyMember && (user as any).owner ? (user as any).owner : user,
    loading,
    error,
    token,
    isAuthenticated,
    login,
    logout,
    getInitials,
    updateUserProfile,
    updateUserPassword,
    refreshUserProfile,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
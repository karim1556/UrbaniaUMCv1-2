// Auth utility functions

interface User {
  userId: string;
  isAdmin?: boolean;
  // Add other user properties as needed
}

export const setAuthData = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('admin', user.isAdmin ? 'true' : 'false');
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  localStorage.removeItem('user');
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const admin = localStorage.getItem('admin') === 'true';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    token,
    isAdmin: admin,
    user
  };
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const isAdmin = () => {
  return localStorage.getItem('admin') === 'true';
}; 
import axios from 'axios';

// Log configuration for debugging
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
// Ensure base ends with /api (normalize incoming values)
const apiBaseUrl = rawBase.endsWith('/api') ? rawBase.replace(/\/+$/, '') : rawBase.replace(/\/+$/, '') + '/api';
console.log('API base URL:', apiBaseUrl);

// Create Axios instance with appropriate configuration
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to avoid caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    
    // Special handling for registration endpoints
    if (config.url?.includes('/registrations/')) {
      console.log('📝 Registration request detected:', config.url);
      console.log('📝 Registration data:', JSON.stringify(config.data, null, 2));
    }
    
    // Log the request details
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      url: config.url,
      headers: config.headers,
      data: config.data ? 'DATA_PRESENT' : 'NO_DATA', // Don't log full data for privacy
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response (${response.status}):`, {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataReceived: response.data ? 'DATA_RECEIVED' : 'NO_DATA'
    });
    
    // Special handling for registration responses
    if (response.config.url?.includes('/registrations/')) {
      console.log('📝 Registration response:', JSON.stringify(response.data, null, 2));
    }
    
    return response;
  },
  (error) => {
    // Process response errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      });
      
      // Special handling for registration errors
      if (error.config?.url?.includes('/registrations/')) {
        console.error('📝 Registration error details:', error.response.data);
      }
      
      // Handle specific error codes
      if (error.response.status === 401) {
        console.error('Authentication error - redirecting to login');
        // We could redirect to login here or dispatch an event
      } else if (error.response.status === 403) {
        console.error('Permission denied');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      } else if (error.response.status === 500) {
        console.error('Server error');
      }
      
      // Return a more user-friendly error message if available
      if (error.response.data && error.response.data.message) {
        error.userMessage = error.response.data.message;
      } else {
        error.userMessage = 'An error occurred while processing your request.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', {
        request: error.request,
        url: error.config?.url,
        method: error.config?.method
      });
      error.userMessage = 'No response from server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Setup Error:', error.message);
      error.userMessage = 'Error setting up request. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Export a function to test API connectivity
export const testApiConnection = async () => {
  try {
    console.log('Testing API connectivity...');
    const response = await api.get('/');
    console.log('API connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error };
  }
};

// Export a function to test registration API
export const testRegistrationAPI = async () => {
  try {
    console.log('Testing registration API...');
    const response = await api.get('/registrations/test');
    console.log('Registration API test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration API test failed:', error);
    return { success: false, error };
  }
};

export default api; 
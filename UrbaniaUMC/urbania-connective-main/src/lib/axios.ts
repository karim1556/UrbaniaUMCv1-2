import axios from 'axios';

// Determine base URL for API requests. Prefer VITE_API_URL, fall back
// to window.location.origin (so deployed builds without the env var still
// talk to the same host), and finally localhost for dev safety.
const envBase = typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL as string | undefined)
  ? String(import.meta.env.VITE_API_URL)
  : undefined;
const fallbackOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:4000';
const rawBase = (envBase && envBase.trim() !== '') ? envBase : fallbackOrigin;
// Determine API base URL. In development (localhost) prefer local backend
// so the UI talks to your local server; otherwise prefer VITE_API_URL or
// fall back to the deployed backend.
const deployedApi = 'https://urbaniaumcv1-2.onrender.com/api';
let apiBaseUrl: string;
if (typeof window !== 'undefined') {
  const hostname = (window.location && window.location.hostname) || '';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiBaseUrl = 'http://localhost:8080/api';
  } else if (envBase && envBase.trim() !== '') {
    apiBaseUrl = envBase;
  } else {
    apiBaseUrl = deployedApi;
  }
} else {
  apiBaseUrl = envBase || deployedApi;
}
// Helpful runtime warnings for deployed environments
console.log('API base URL (resolved):', apiBaseUrl, '(source:', envBase ? 'VITE_API_URL' : 'window.location.origin/fallback', ')');

// If the API base resolves to the same origin as the frontend, it's likely
// that `VITE_API_URL` was not set in the hosting environment (e.g. Vercel)
// and requests will be sent to the static host (causing 405). Show a clear
// warning in the browser console to help identify this misconfiguration.
try {
  if (typeof window !== 'undefined') {
    const frontendOrigin = window.location.origin.replace(/:\/\/+$/, '');
    const apiOrigin = (apiBaseUrl || '').replace(/\/api\/?$/, '').replace(/:\/\/+$/, '');
    if (apiOrigin === frontendOrigin) {
      if (!envBase) {
        console.error("Configuration warning: VITE_API_URL is not set. The app will send API requests to the static host (", frontendOrigin, ") which cannot handle POST endpoints.\nSet VITE_API_URL=https://<your-backend> in Vercel Environment Variables and redeploy.");
      } else if (String(envBase).replace(/:\/\/+$/, '') === frontendOrigin) {
        console.error("Configuration warning: VITE_API_URL is set to the same origin as the frontend (", frontendOrigin, "). Update VITE_API_URL to point to your backend (e.g. https://urbaniaumcv1-2.onrender.com) and redeploy.");
      }
    }
  }
} catch (e) {
  // ignore any errors from the runtime check
}

// Create Axios instance with appropriate configuration
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Remove client-side timeout so we don't abort requests while the server
  // is processing. Server-side timeouts should be enforced by the API.
  timeout: 0,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure baseURL is always set on the config (defensive for mixed imports)
    if (!config.baseURL) config.baseURL = apiBaseUrl;
    // Normalize baseURL and avoid double '/api' in final URL
    if (config.baseURL) config.baseURL = String(config.baseURL).replace(/\/+$/, '');
    if (config.url && config.baseURL && String(config.baseURL).endsWith('/api') && String(config.url).startsWith('/api')) {
      config.url = String(config.url).replace(/^\/api/, '');
    }

    // Compute absolute URL for logging/debugging
    try {
      const base = String(config.baseURL || apiBaseUrl).replace(/\/+$/, '') + '/';
      const path = String(config.url || '').replace(/^\/+/, '');
      // eslint-disable-next-line no-param-reassign
      (config as any).__fullRequestUrl = base + path;
    } catch (e) {
      // ignore
    }
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
    
    // Log the request details with computed absolute URL
    console.log(`API Request: ${config.method?.toUpperCase()} ${(config as any).__fullRequestUrl || (config.baseURL + config.url)}`, {
      url: config.url,
      fullUrl: (config as any).__fullRequestUrl,
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
        fullUrl: (error.config as any)?.__fullRequestUrl,
        method: error.config?.method
      });
      // Attempt a lightweight fetch fallback for diagnostics (do not replace production flow)
      (async () => {
        try {
          const cfg = error.config || {};
          const fullUrl = (cfg as any).__fullRequestUrl || (String(cfg.baseURL || apiBaseUrl).replace(/\/+$/, '') + '/' + String(cfg.url || '').replace(/^\/+/, ''));
          const fetchRes = await fetch(fullUrl, {
            method: (cfg.method || 'get').toUpperCase(),
            headers: cfg.headers || { 'Content-Type': 'application/json' },
            body: cfg.data ? JSON.stringify(cfg.data) : undefined,
            credentials: cfg.withCredentials ? 'include' : 'same-origin'
          });
          console.warn('Fetch fallback status:', fetchRes.status, 'for', fullUrl);
        } catch (fe) {
          console.warn('Fetch fallback failed:', fe);
        }
      })();

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
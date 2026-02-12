import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    if (import.meta.env.MODE === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Ensure headers exist
    if (!config.headers) {
      config.headers = {};
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.MODE === 'development') {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        console.warn('⚠️ Unauthorized - Token may be invalid or expired');
      } else if (error.response.status === 404) {
        console.warn('⚠️ Resource not found:', error.config.url);
      } else if (error.response.status === 500) {
        console.error('⚠️ Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error - No response from server:', error.message);
      console.error('Make sure backend is running and accessible');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

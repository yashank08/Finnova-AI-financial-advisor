import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finnova_token') || sessionStorage.getItem('finnova_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid tokens if 401 error occurs on protected route
      localStorage.removeItem('finnova_token');
      sessionStorage.removeItem('finnova_token');
      localStorage.removeItem('finnova_user');
      sessionStorage.removeItem('finnova_user');
    }
    return Promise.reject(error);
  }
);

export default api;

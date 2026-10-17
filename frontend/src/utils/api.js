import axios from 'axios';

let base = import.meta.env.VITE_API_URL || '/api';

if (typeof base === 'string') {
  base = base.trim();
  // Strip trailing slashes
  while (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  // If the user inputs their Render backend domain like https://my-backend.onrender.com
  // automatically append /api so endpoints like api.post('/auth/login') hit https://my-backend.onrender.com/api/auth/login
  if (base.startsWith('http') && !base.endsWith('/api')) {
    base = `${base}/api`;
  }
}

export const API_BASE_URL = base;

const api = axios.create({
  baseURL: API_BASE_URL,
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

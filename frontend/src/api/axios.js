import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor: Attach JWT token from localStorage and handle FormData Content-Type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interview_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, delete Content-Type so browser / axios sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Gracefully handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('interview_token');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
// Handle 403 — attach isForbidden flag so callers can handle silently
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      err.isForbidden = true;
      err.friendlyMessage = 'You do not have permission to perform this action.';
    }
    return Promise.reject(err);
  }
);

export default api;

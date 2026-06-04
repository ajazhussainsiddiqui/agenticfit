import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const API_V1_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : "/api/v1";

const api = axios.create({
  baseURL: API_V1_URL,
  timeout: 30000,
});

// Request interceptor: ONLY attach Authorization if token exists
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // If no token, send request WITHOUT Authorization header (guest mode)
  return config;
});

// Response interceptor: handle 401 gracefully
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Do NOT redirect. Return error to caller for inline upsell handling.
      return Promise.reject({ ...err, isAuthError: true });
    }
    return Promise.reject(err);
  }
);

export default api;

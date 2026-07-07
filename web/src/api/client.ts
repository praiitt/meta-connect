import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Determine base URL:
// In dev: Use VITE_API_URL or fallback to http://localhost:5000/api
// In prod (when served by backend): Use relative path '/api'
const isProd = import.meta.env.PROD;
const baseURL = isProd 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

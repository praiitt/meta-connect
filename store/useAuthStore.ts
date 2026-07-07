import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export interface User {
  id: string;
  email?: string;
  name: string;
  phone: string;
  company: string;
  gst?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (phone: string, loginCode: string) => Promise<boolean>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true, // starts loading while checking auth
  error: null,
  
  clearError: () => set({ error: null }),

  login: async (phone, loginCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { phone, loginCode });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Login failed. Please check your details.',
        isLoading: false 
      });
      return false;
    }
  },

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));
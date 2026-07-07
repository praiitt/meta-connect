import { create } from 'zustand';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  admin: localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user') as string) : null,
  setAuth: (token, admin) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    set({ token, admin });
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ token: null, admin: null });
  },
}));

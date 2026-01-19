import { create } from 'zustand';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear user from store
    set({ user: null });
    
    // Clear cookies by redirecting through logout API or clearing manually
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    
    // Redirect ke login page
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return get().user !== null;
  },
}));

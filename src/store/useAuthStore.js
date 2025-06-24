import { create } from 'zustand';
import { signIn, signOut } from '../lib/supabase';

// For demo purposes, we're using a mock admin account
const MOCK_ADMIN = {
  id: 'mock-admin-id',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
};

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user
  }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // For demo purposes, allow login with any credentials
      if (email === 'admin@example.com' && password === 'password') {
        // Mock successful login
        setTimeout(() => {
          set({
            user: MOCK_ADMIN,
            isAuthenticated: true,
            loading: false
          });
        }, 800);
        return;
      }

      // Attempt real Supabase login
      const { error } = await signIn(email, password);
      if (error) throw error;

      // If we reach here with Supabase, we'd fetch user details
      // But for now, we'll stick with the mock rejection below
      throw new Error('Invalid credentials');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      set({ error: errorMessage, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      set({ error: errorMessage, loading: false });
    }
  }
}));

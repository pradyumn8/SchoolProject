import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase'; // ✅ Your Firebase config

const SESSION_KEY = 'auth_user';

const saveUserToSession = (user) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const loadUserFromSession = () => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const clearUserFromSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const useAuthStore = create((set) => {
  const storedUser = loadUserFromSession(); // ✅ Load from session if available

  return {
    user: storedUser,
    loading: false,
    error: null,
    onAuthStateChanged: !!storedUser,

    setUser: (user) => {
      if (user) saveUserToSession(user);
      else clearUserFromSession();

      set({ user, onAuthStateChanged: !!user });
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        saveUserToSession(user);
        set({ user, onAuthStateChanged: true, loading: false });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        set({ error: errorMessage, loading: false });
      }
    },

    logout: async () => {
      set({ loading: true });
      try {
        await signOut(auth);
        clearUserFromSession();
        set({ user: null, onAuthStateChanged: false, loading: false });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Logout failed';
        set({ error: errorMessage, loading: false });
      }
    },

    listenToAuthChanges: () => {
      set({ loading: true });

      onAuthStateChanged(auth, (user) => {
        if (user) {
          saveUserToSession(user);
        } else {
          clearUserFromSession();
        }

        set({
          user,
          onAuthStateChanged: !!user,
          loading: false,
        });
      });
    },
  };
});

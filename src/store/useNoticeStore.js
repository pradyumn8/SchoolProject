import axios from 'axios';
import { create } from 'zustand';

// Ensure VITE_API_URL includes your API base, e.g. "https://ebr-school-management-sytem.onrender.com//api"
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const useNoticeStore = create((set, get) => ({
  notices: [],
  loading: false,
  error: null,

  // Fetch all saved notice templates
  fetchNotices: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`${API_BASE}/templates`);
      set({ notices: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Add a new notice template
  addNotice: async (noticeData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(
        `${API_BASE}/templates`,
        noticeData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      set(state => ({ notices: [data, ...state.notices], loading: false }));
      return data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
      throw err;
    }
  },

  // Helper to get a notice by ID
  getNoticeById: (id) => get().notices.find(n => n._id === id),
}));

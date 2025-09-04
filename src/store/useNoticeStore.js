import axios from 'axios';
import { create } from 'zustand';

const HOST = (import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: `${HOST}/api/notices`,
  headers: { 'Content-Type': 'application/json' },
});

export const useNoticeStore = create((set, get) => ({
  notices: [],
  loading: false,
  error: null,

  // Fetch all saved notice templates
  fetchNotices: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/');
      set({ notices: data, loading: false });
    } catch (err) {
      // prefer server’s error message if present
      const message = err.response?.data?.error || err.message;
      set({ error: message, loading: false });
    }
  },

  // Add a new notice template
  addNotice: async (noticeData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/', noticeData);
      set(state => ({ notices: [data, ...state.notices], loading: false }));
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      set({ error: message, loading: false });
      throw err;
    }
  },

  // Helper to get a notice by its Mongo `_id`
  getNoticeById: (id) =>
    get().notices.find((n) => n._id === id) || null,

  // Action: remove one notice
  removeNotice: (id) =>
    set((state) => ({
      notices: state.notices.filter((n) => n._id !== id),
    })),  
}));

// import axios from 'axios';
// import { create } from 'zustand';

// // Ensure VITE_API_URL includes your API base, e.g. "http://localhost:4000/api"
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// export const useNoticeStore = create((set, get) => ({
//   notices: [],
//   loading: false,
//   error: null,

//   // Fetch all saved notice templates
//   fetchNotices: async () => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await axios.get(`${API_BASE}/api/notice`);
//       set({ notices: data, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   // Add a new notice template
//   addNotice: async (noticeData) => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await axios.post(
//         `${API_BASE}/api/notice`,
//         noticeData,
//         { headers: { 'Content-Type': 'application/json' } }
//       );
//       set(state => ({ notices: [data, ...state.notices], loading: false }));
//       return data;
//     } catch (err) {
//       set({ error: err.response?.data?.error || err.message, loading: false });
//       throw err;
//     }
//   },

//   // Helper to get a notice by ID
//   getNoticeById: (id) => get().notices.find(n => n._id === id),
// }));

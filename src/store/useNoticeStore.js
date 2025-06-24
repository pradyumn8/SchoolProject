import { create } from 'zustand';
import { notices as mockNotices } from '../lib/mockData';

export const useNoticeStore = create((set, get) => ({
  notices: [],
  loading: false,
  error: null,

  fetchNotices: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use mock data
      set({ notices: mockNotices, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notices';
      set({ error: errorMessage, loading: false });
    }
  },

  addNotice: async (noticeData) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const newNotice = {
        ...noticeData,
        id: Math.max(0, ...get().notices.map(n => n.id)) + 1,
        created: new Date()
      };

      set(state => ({
        notices: [newNotice, ...state.notices],
        loading: false
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add notice';
      set({ error: errorMessage, loading: false });
    }
  },

  getNoticeById: (id) => {
    return get().notices.find(notice => notice.id === id);
  }
}));

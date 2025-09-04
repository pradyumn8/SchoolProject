import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL;

export const useStudentStore = create((set, get) => ({
  students: [],
  divisions: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/students`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      set({ students: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch students',
        loading: false,
      });
    }
  },


  getStudentById: (id) =>
    get().students.find((s) => s.id === id || s._id === id),

  getStudentsByDivision: (divisionId) =>
    get().students.filter((s) => s.divisionId === divisionId),

  getDivisionById: (id) =>
    get().divisions.find((d) => d.id === id),

  searchStudents: (query) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return get().students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.grNumber?.toLowerCase().includes(q)
    );
  },
}));
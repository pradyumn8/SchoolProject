import { create } from 'zustand';
// import { students as mockStudents, divisions as mockDivisions } from '../lib/mockData';

export const useStudentStore = create((set, get) => ({
  students: [],
  divisions: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Use mock data
      set({ students: mockStudents, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchDivisions: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      // Use mock data
      set({ divisions: mockDivisions, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch divisions';
      set({ error: errorMessage, loading: false });
    }
  },

  getStudentById: (id) => {
    return get().students.find(student => student.id === id);
  },

  getStudentsByDivision: (divisionId) => {
    return get().students.filter(student => student.divisionId === divisionId);
  },

  getDivisionById: (id) => {
    return get().divisions.find(division => division.id === id);
  },

  searchStudents: (query) => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return get().students.filter(student =>
      student.name.toLowerCase().includes(lowerQuery) ||
      student.rollNumber.toLowerCase().includes(lowerQuery) ||
      student.grNumber?.toLowerCase().includes(lowerQuery)
    );
  }
}));

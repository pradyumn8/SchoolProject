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
      const res = await fetch(`${API_URL}/students`);
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

  fetchDivisions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/divisions`);
      if (!res.ok) throw new Error('Failed to fetch divisions');
      const data = await res.json();
      set({ divisions: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch divisions',
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
        s.rollNumber.toLowerCase().includes(q) ||
        s.grNumber?.toLowerCase().includes(q)
    );
  },
}));




// // src/store/useStudentStore.js
// import { create } from 'zustand'
// import { students as mockStudents, divisions as mockDivisions } from '../lib/mockData'

// export const useStudentStore = create((set, get) => ({
//   students: [],
//   divisions: [],
//   loading: false,
//   error: null,

//   fetchStudents: async () => {
//     set({ loading: true, error: null })
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 600))
//       // Use mock data
//       set({ students: mockStudents, loading: false })
//     } catch (err) {
//       set({
//         error: err.message || 'Failed to fetch students',
//         loading: false
//       })
//     }
//   },

//   fetchDivisions: async () => {
//     set({ loading: true, error: null })
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 400))
//       // Use mock data
//       set({ divisions: mockDivisions, loading: false })
//     } catch (err) {
//       set({
//         error: err.message || 'Failed to fetch divisions',
//         loading: false
//       })
//     }
//   },

//   getStudentById: (id) => {
//     return get().students.find(student => student.id === id)
//   },

//   getStudentsByDivision: (divisionId) => {
//     return get().students.filter(student => student.divisionId === divisionId)
//   },

//   getDivisionById: (id) => {
//     return get().divisions.find(division => division.id === id)
//   },

//   searchStudents: (query) => {
//     if (!query.trim()) return []

//     const lowerQuery = query.toLowerCase()
//     return get().students.filter(student =>
//       student.name.toLowerCase().includes(lowerQuery) ||
//       student.rollNumber.toLowerCase().includes(lowerQuery) ||
//       (student.grNumber && student.grNumber.toLowerCase().includes(lowerQuery))
//     )
//   }
// }))

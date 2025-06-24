import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NoticesPage from './pages/NoticesPage';
import CreateNoticePage from './pages/CreateNoticePage';
import StudentsPage from './pages/StudentsPage';
import AppLayout from './components/layout/AppLayout';
import { useStudentStore } from './store/useStudentStore';

function App() {
  const { fetchStudents, fetchDivisions } = useStudentStore();

  useEffect(() => {
    // Load initial data
    fetchStudents();
    fetchDivisions();
  }, [fetchStudents, fetchDivisions]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="notices/create" element={<CreateNoticePage />} />
          <Route path="students" element={<StudentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

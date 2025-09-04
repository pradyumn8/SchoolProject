// App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NoticesPage from './pages/NoticesPage';
import CreateNoticePage from './pages/CreateNoticePage';
import StudentsPage from './pages/StudentsPage';
import AddStudent from './pages/AddStudent';
import SendNotice from './pages/SendNotice';
import AppLayout from './components/layout/AppLayout';
import { useStudentStore } from './store/useStudentStore';
import { useAuthStore } from './store/useAuthStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import ResetPassword from './pages/ResetPassword';

function App() {
  const { fetchStudents } = useStudentStore();
  const { listenToAuthChanges } = useAuthStore();

  useEffect(() => {
    listenToAuthChanges();
    fetchStudents();
  }, [fetchStudents, listenToAuthChanges]);

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected layout */}
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="notices/create" element={<CreateNoticePage />} />
          <Route path="notices/send-notice" element={<SendNotice />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="students/:id/edit" element={<AddStudent />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;

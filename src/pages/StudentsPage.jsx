import React, { useEffect } from 'react';
import { useStudentStore } from '../store/useStudentStore';
import StudentList from '../components/students/StudentList';
import { UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const StudentsPage = () => {
  const { fetchStudents, fetchDivisions, loading } = useStudentStore();

  useEffect(() => {
    fetchStudents();
    fetchDivisions();
  }, [fetchStudents, fetchDivisions]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
        <Button icon={<UserPlus className="h-4 w-4" />}>
          Add Student
        </Button>
      </div>

      <StudentList />
    </motion.div>
  );
};

export default StudentsPage;

import React, { useEffect, useRef, useState } from 'react';
import { useStudentStore } from '../store/useStudentStore';
import StudentList from '../components/students/StudentList';
import { Info, UserCircle2, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const { fetchStudents, fetchDivisions, loading } = useStudentStore();
  const navigate = useNavigate();

  // --- Bulk Upload Setup ---
  const fileInputRef = useRef(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://ebr-school-management-sytem.onrender.com//api';

  const handleAddStudent = () => navigate('/add-student');
  const handleBulkClick = () => fileInputRef.current?.click();

  const handleBulkChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    try {
      setBulkLoading(true);
      const { data } = await axios.post(
        `${API_URL}/students/bulk-upload`,
        form
      );
      if (data.success) {
        toast.success(data.message);
        await fetchStudents();
        await fetchDivisions();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setBulkLoading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDivisions();
  }, [fetchStudents, fetchDivisions]);

  return (
    <motion.div
      className="space-y-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 sm:mb-0">
          Student Management
        </h1>

        {/* Hidden file input */}
        <input
          type="file"
          accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          ref={fileInputRef}
          onChange={handleBulkChange}
          className="hidden"
        />

        {/* Actions: centered on mobile, inline on desktop */}
        <div className="flex flex-wrap items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {/* Info with responsive tooltip */}
          <div
            className="relative p-1 self-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="h-5 w-5 text-red-500 hover:text-red-800 cursor-pointer" />
            {showTooltip && (
              <div className="absolute inset-x-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 mt-2 max-w-xs sm:w-80 p-4 bg-white rounded-lg shadow-lg text-sm text-gray-700 z-10">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Click “Bulk Upload”</strong><br />File picker appears.</li>
                  <li><strong>Choose Your File</strong><br />Upload CSV or Excel (.xls/.xlsx). Wrong type? See error.</li>
                  <li><strong>Uploading & Processing</strong><br />System reads rows, saves data. Duplicates skip.</li>
                  <li className="space-y-1">
                    <strong>Download Sample xls/xlsx File</strong>
                    <br />
                    <a
                      href="https://example.com/your-template.csv"
                      download
                      className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Download
                    </a>
                  </li>
                  <li className="space-y-1">
                    <strong>Download Sample CSV File</strong>
                    <br />
                    <a
                      href="https://example.com/your-template.csv"
                      download
                      className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Download
                    </a>
                  </li>

                </ol>
              </div>
            )}
          </div>

          <Button
            onClick={handleBulkClick}
            icon={<UserCircle2 className="h-4 w-4" />}
            disabled={bulkLoading}
            className="w-full sm:w-auto"
          >
            {bulkLoading ? 'Uploading…' : 'Bulk Upload Students'}
          </Button>

          <Button
            onClick={handleAddStudent}
            icon={<UserPlus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <p className="text-gray-500">Loading students…</p>}

      {/* Student list */}
      <StudentList />
    </motion.div>
  );
};

export default StudentsPage;
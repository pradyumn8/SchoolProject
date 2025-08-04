// src/components/StudentList.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import { Standard } from '../../pages/AddStudent';
import Button from '../ui/Button';
import { Search, Filter, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentList = ({
  onSelectStudent,
  selectable = false
}) => {
  const { fetchStudents, students, divisions, loading } = useStudentStore();
  const navigate = useNavigate();

  // existing filters
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // new standard filter state
  const [standardFilter, setStandardFilter] = useState('all');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const headerCheckboxRef = useRef(null);


  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleDivisionChange = (e) =>
    setDivisionFilter(e.target.value);
  const handleStandardChange = (e) =>
    setStandardFilter(e.target.value);

  // fetch on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.grNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        divisionFilter === 'all' || student.divisionId === divisionFilter;

      // apply the standard filter
      const matchesStandard =
        standardFilter === 'all' || student.standard === standardFilter;

      return matchesSearch && matchesDivision && matchesStandard;
    });
  }, [students, searchQuery, divisionFilter, standardFilter]);

  // Handle select all / individual
  const allSelected = filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredStudents.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected students?`)) return;
    try {
      await Promise.all(
        selectedIds.map(id => axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/students/${id}`))
      );
      await fetchStudents();
      setSelectedIds([]);

      toast.success(`${selectedIds.length} students deleted.`);

    } catch (err) {
      console.error(err);
      toast.error('Bulk delete failed.');
    }
  };

  // const handleDelete = async (student) => {
  //   try {
  //     await axios.delete(`http://localhost:4000/api/students/${student._id}`);
  //     await fetchStudents();
  //     toast.success(`${student.name} has been deleted.`, { position: 'top-right' });
  //   } catch (err) {
  //     console.error('Delete failed:', err);
  //     toast.error(`Could not delete ${student.name}.`, { position: 'top-right' });
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Filters & Bulk Delete */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll or GR"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Division Filter */}
          {/* <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              className="py-2 px-3 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div._id} value={div._id}>{div.name}</option>
              ))}
            </select>
          </div> */}

          {/* Standard Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={standardFilter}
              onChange={e => setStandardFilter(e.target.value)}
              className="py-2 px-3 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Standards</option>
              {Standard.map(s => (
                <option key={s.Standard} value={s.Standard}>{s.Standard}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex justify-center">
            <div class="relative inline-block p-0.5 rounded-full overflow-hidden hover:scale-105 transition duration-300 active:scale-100 before:content-[''] before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,_#0062ff,_#0077ff,_#0062ff)] button-wrapper">
              <Button
                className="relative z-10 bg-red-700 text-white px-8 py-3 font-medium text-sm" variant="destructive"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedIds.length})
              </Button>

            </div>

          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G.R. No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">No students found.</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student._id)}
                      onChange={() => toggleSelectOne(student._id)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.grNumber || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{student.name}</div></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.standard || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.contactNumber || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      title="Update"
                      className="p-2 rounded-full hover:bg-primary-50 transition text-primary-600 focus:ring-2 focus:ring-primary-200"
                      onClick={() => navigate(`/students/${student._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      title="Delete"
                      className="p-2 rounded-full hover:bg-red-100 transition text-red-600 focus:ring-2 focus:ring-red-200"
                      onClick={async () => {
                        if (window.confirm(`Delete ${student.name}?`)) {
                          try {
                            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/students/${student._id}`);
                            toast.success(`${student.name} deleted.`);
                            await fetchStudents();
                          } catch (err) {
                            console.error(err);
                            toast.error(`Could not delete ${student.name}.`);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredStudents.length}</span> of{' '}
          <span className="font-medium">{students.length}</span> students
        </div>
      </div>
    </div>
  );
};

export default StudentList;

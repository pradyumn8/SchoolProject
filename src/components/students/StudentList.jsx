import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import Button from '../ui/Button';
import { Search, Filter, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentList = ({
  onSelectStudent,
  selectable = false
}) => {
  const { fetchStudents, students, loading } = useStudentStore();
  const navigate = useNavigate();

  // filters
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [standardFilter, setStandardFilter] = useState('all');

  // multi-select
  const [selectedIds, setSelectedIds] = useState([]);
  const headerCheckboxRef = useRef(null);
  const hasSelection = selectedIds.length > 0;

  // fetch on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ----- standards & divisions (for dropdowns) -----
  const [standards, setStandards] = useState([]);
  const [divisionsByStd, setDivisionsByStd] = useState({});
  const [allDivisions, setAllDivisions] = useState([]);

  useEffect(() => {
    if (!Array.isArray(students)) return;

    const stdSet = new Set();
    const allDivSet = new Set();
    const mapSets = {}; // { std: Set(divisions) }

    for (const s of students) {
      const std = String(s?.standard ?? '').trim();
      const div = String(s?.divisionId ?? '').trim();

      if (std) stdSet.add(std);
      if (div) allDivSet.add(div);

      if (std) {
        if (!mapSets[std]) mapSets[std] = new Set();
        if (div) mapSets[std].add(div);
      }
    }

    const sortAlphaNum = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

    setStandards(Array.from(stdSet).sort(sortAlphaNum));
    setAllDivisions(Array.from(allDivSet).sort(sortAlphaNum));

    const mapObj = {};
    Object.keys(mapSets).forEach(std => {
      mapObj[std] = Array.from(mapSets[std]).sort(sortAlphaNum);
    });
    setDivisionsByStd(mapObj);
  }, [students]);

  const divisionOptions = useMemo(() => {
    if (standardFilter === 'all') return allDivisions;
    return divisionsByStd[standardFilter] || [];
  }, [standardFilter, allDivisions, divisionsByStd]);

  // keep division valid for current standard
  useEffect(() => {
    if (divisionFilter === 'all') return;
    if (!divisionOptions.includes(divisionFilter)) {
      setDivisionFilter('all');
    }
  }, [standardFilter, divisionOptions, divisionFilter]);

  // ----- main filtered list -----
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    const q = searchQuery.toLowerCase();
    return students.filter(student => {
      const matchesSearch =
        student.name?.toLowerCase().includes(q) ||
        student.grNumber?.toLowerCase().includes(q);

      const matchesDivision =
        divisionFilter === 'all' || student.divisionId === divisionFilter;

      const matchesStandard =
        standardFilter === 'all' || student.standard === standardFilter;

      return matchesSearch && matchesDivision && matchesStandard;
    });
  }, [students, searchQuery, divisionFilter, standardFilter]);

  // select-all / partial-select state (must be after filteredStudents)
  const allSelected =
    filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < filteredStudents.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  // prune selections when filters hide rows
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => filteredStudents.some(s => s._id === id)));
  }, [filteredStudents]);

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // single delete (row)
  const handleDeleteOne = async (student) => {
    if (hasSelection) return; // guard while disabled
    if (!window.confirm(`Delete ${student.name}?`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/students/${student._id}`);
      toast.success(`${student.name} deleted.`);
      await fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error(`Could not delete ${student.name}.`);
    }
  };

  // bulk delete + hard refresh
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected students?`)) return;
    try {
      await Promise.all(
        selectedIds.map(id =>
          axios.delete(`${import.meta.env.VITE_API_URL}/api/students/${id}`)
        )
      );
      toast.success(`${selectedIds.length} students deleted.`);
      await fetchStudents();
      setSelectedIds([]);

      // hard refresh as requested
      setTimeout(() => {
        navigate(0); // or window.location.reload();
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error('Bulk delete failed.');
    }
  };

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
              placeholder="Search by name or G.R. No."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Division Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={divisionFilter}
              onChange={e => setDivisionFilter(e.target.value)}
              className="py-2 px-3 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Divisions</option>
              {divisionOptions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          {/* Standard Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={standardFilter}
              onChange={e => setStandardFilter(e.target.value)}
              className="py-2 px-3 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Standards</option>
              {standards.map(std => (
                <option key={std} value={std}>{std}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex justify-center">
            <div className="relative inline-block p-0.5 rounded-full overflow-hidden hover:scale-105 transition duration-300 active:scale-100 before:content-[''] before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,_#0062ff,_#0077ff,_#0062ff)] button-wrapper">
              <Button
                className="relative z-10 bg-red-700 text-white px-8 py-3 font-medium text-sm"
                variant="destructive"
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.grNumber || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {student.standard || '-'} {student.divisionId || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.contactNumber || '-'}</td>

                  {/* Update */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      type="button"
                      title={hasSelection ? 'Disabled while multi-select is active' : 'Update'}
                      disabled={hasSelection}
                      aria-disabled={hasSelection}
                      tabIndex={hasSelection ? -1 : 0}
                      className={[
                        'p-2 rounded-full transition',
                        hasSelection
                          ? 'opacity-40 cursor-not-allowed pointer-events-none text-gray-400'
                          : 'text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-200'
                      ].join(' ')}
                      onClick={() => {
                        if (hasSelection) return;
                        navigate(`/students/${student._id}/edit`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      type="button"
                      title={hasSelection ? 'Disabled while multi-select is active' : 'Delete'}
                      disabled={hasSelection}
                      aria-disabled={hasSelection}
                      tabIndex={hasSelection ? -1 : 0}
                      className={[
                        'p-2 rounded-full transition',
                        hasSelection
                          ? 'opacity-40 cursor-not-allowed pointer-events-none text-gray-400'
                          : 'text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-200'
                      ].join(' ')}
                      onClick={() => handleDeleteOne(student)}
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

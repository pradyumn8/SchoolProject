import React from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import Button from '../ui/Button';
import { Search, Filter } from 'lucide-react';

const StudentList = ({ onSelectStudent, selectable = false }) => {
  const { students, divisions, loading } = useStudentStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [divisionFilter, setDivisionFilter] = React.useState('all');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDivisionChange = (e) => {
    setDivisionFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
  };

  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.grNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        divisionFilter === 'all' || student.divisionId === divisionFilter;

      return matchesSearch && matchesDivision;
    });
  }, [students, searchQuery, divisionFilter]);

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll number or GR number"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={divisionFilter === 'all' ? 'all' : divisionFilter.toString()}
              onChange={handleDivisionChange}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="all">All Classes</option>
              {divisions.map(division => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G.R. No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              {selectable && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={selectable ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No students found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDivisionName(student.divisionId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.contactNumber}</td>
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectStudent?.(student)}
                      >
                        Select
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

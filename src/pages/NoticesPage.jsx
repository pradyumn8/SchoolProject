import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNoticeStore } from '../store/useNoticeStore';
import NoticeCard from '../components/notices/NoticeCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, Filter, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const NoticesPage = () => {
  const { notices, fetchNotices, loading } = useNoticeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = notices.filter(notice => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || notice.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const noticeTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'parentMeeting', label: 'Parent Meeting' },
    { value: 'feeDue', label: 'Fee Due' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Notice Management</h1>
        <Link to="/notices/create">
          <Button icon={<Plus className="h-4 w-4" />}>
            Create Template
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Filter Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center space-x-2 sm:w-64">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                {noticeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No notices found matching your criteria.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredNotices.map(notice => (
            <motion.div key={notice.id} variants={item}>
              <NoticeCard notice={notice} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default NoticesPage;

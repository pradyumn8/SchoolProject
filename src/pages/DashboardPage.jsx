import React, { useEffect } from 'react';
import { useNoticeStore } from '../store/useNoticeStore';
import { useStudentStore } from '../store/useStudentStore';
import NoticeStats from '../components/dashboard/NoticeStats';
import RecentNotices from '../components/dashboard/RecentNotices';
import { Bell, Users, BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { notices, fetchNotices, loading: noticeLoading } = useNoticeStore();
  const { students, divisions, fetchStudents, fetchDivisions, loading: studentLoading } = useStudentStore();

  useEffect(() => {
    fetchNotices();
    fetchStudents();
    fetchDivisions();
  }, [fetchNotices, fetchStudents, fetchDivisions]);

  const loading = noticeLoading || studentLoading;

  const generateQuickActionLink = (href, title, description, icon, color) => (
    <Link to={href} className="block">
      <Card className={`hover:shadow-md transition-shadow ${color}`}>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link to="/notices/create">
          <Button icon={<Plus className="h-4 w-4" />}>
            Create Notice
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NoticeStats notices={notices} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <RecentNotices notices={notices} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generateQuickActionLink(
                    "/notices/create",
                    "Send New Notice",
                    "Create and send a new notification",
                    <Bell className="h-6 w-6 text-primary-600" />,
                    "border-l-4 border-primary-600"
                  )}
                  {generateQuickActionLink(
                    "/students",
                    "Manage Students",
                    "View and manage student records",
                    <Users className="h-6 w-6 text-secondary-600" />,
                    "border-l-4 border-secondary-600"
                  )}
                  {generateQuickActionLink(
                    "/notices",
                    "Notice History",
                    "View all previously sent notices",
                    <BookOpen className="h-6 w-6 text-accent-600" />,
                    "border-l-4 border-accent-600"
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">System Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Students:</span>
                    <span className="text-sm font-medium">{students.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Classes/Divisions:</span>
                    <span className="text-sm font-medium">{divisions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Notices:</span>
                    <span className="text-sm font-medium">{notices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Notice:</span>
                    <span className="text-sm font-medium">
                      {notices.length > 0
                        ? new Date(Math.max(...notices.map(n => new Date(n.created).getTime()))).toLocaleDateString()
                        : 'None'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

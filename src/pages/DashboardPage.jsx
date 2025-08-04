import React, { useEffect } from 'react';
import { useNoticeStore } from '../store/useNoticeStore';
import { useStudentStore } from '../store/useStudentStore';
import NoticeStats from '../components/dashboard/NoticeStats';
import RecentNotices from '../components/dashboard/RecentNotices';
import { Chart as ChartJS, Colors, defaults } from 'chart.js/auto';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Bell, Users, BookOpen, Plus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  messagesOverTime,
  kpis,
  deliveryBreakdown,
  templateUsage,
  sessionVsTemplate
} from '../lib/mockData';

// Global chart defaults
defaults.maintainAspectRatio = false;
defaults.responsive = true;
defaults.plugins.title.display = true;
defaults.plugins.title.align = 'start';
defaults.plugins.title.font.size = 18;
defaults.plugins.title.color = '#111';
defaults.plugins.legend.position = 'bottom';
defaults.elements.line.tension = 0.4;

const DashboardPage = () => {
  const { notices, fetchNotices, loading: noticeLoading } = useNoticeStore();
  const { students, divisions, fetchStudents, loading: studentLoading } = useStudentStore();

  useEffect(() => {
    fetchNotices();
    fetchStudents();
  }, [fetchNotices, fetchStudents]);

  const loading = noticeLoading || studentLoading;

  const generateQuickActionLink = (href, title, description, icon, color) => (
    <Link to={href} className="block">
      <Card className={`hover:shadow-md transition-shadow ${color}`}>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">{icon}</div>
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
        <div className="flex space-x-2">
          <Link to="/notices/create">
            <Button icon={<Plus className="h-4 w-4" />}>Create Template </Button>
          </Link>
          <Link to="/notices/send-notice">
            <Button icon={<Send className="h-4 w-4" />}>Send Notice</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <motion.div 
             initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent>
                  <h4 className="text-sm text-gray-500">Total Messages</h4>
                  <p className="text-2xl font-semibold">{kpis.totalMessages}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h4 className="text-sm text-gray-500">Delivery Rate</h4>
                  <p className="text-2xl font-semibold">{kpis.deliveryRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h4 className="text-sm text-gray-500">Read Rate</h4>
                  <p className="text-2xl font-semibold">{kpis.readRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h4 className="text-sm text-gray-500">Avg Response</h4>
                  <p className="text-2xl font-semibold">{kpis.avgResponseTime}m</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Line, Bar, Doughnut Charts */}
            <motion.div
            initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Messages Over Time</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <Line
                    data={{
                      labels: messagesOverTime.map(d => d.date),
                      datasets: [{
                        label: 'Messages',
                        data: messagesOverTime.map(d => d.count),
                        borderColor: '#064FF0',
                        backgroundColor: 'rgba(6,79,240,0.2)',
                        pointRadius: 3
                      }]
                    }}
                    options={{ plugins: { title: { text: 'Messages Over Time' } } }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Delivery Breakdown</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <Doughnut
                    data={{
                      labels: ['Delivered', 'Read', 'Failed'],
                      datasets: [{
                        data: [deliveryBreakdown.delivered, deliveryBreakdown.read, deliveryBreakdown.failed],
                        backgroundColor: ['#0088FE', '#00C49F', '#FF8042'],
                        borderColor: ['#0088FE', '#00C49F', '#FF8042']
                      }]
                    }}
                    options={{ plugins: { title: { text: 'Delivery Breakdown' } } }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Template Usage</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <Bar
                    data={{
                      labels: templateUsage.map(d => d.name),
                      datasets: [{
                        label: 'Count',
                        data: templateUsage.map(d => d.count),
                        backgroundColor: templateUsage.map((_, i) => Colors[i % Colors.length]),
                        borderRadius: 4
                      }]
                    }}
                    options={{ plugins: { title: { text: 'Template Usage' } } }}
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Message Types</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <Doughnut
                    data={{
                      labels: sessionVsTemplate.map(d => d.name),
                      datasets: [{
                        data: sessionVsTemplate.map(d => d.value),
                        backgroundColor: ['#064FF0', '#00C49F'],
                        borderColor: ['#064FF0', '#00C49F'],
                        cutout: '60%'
                      }]
                    }}
                    options={{ plugins: { title: { text: 'Message Types' } } }}
                  />
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

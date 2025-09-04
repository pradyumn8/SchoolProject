import React, { useEffect, useState } from 'react';
import { useNoticeStore } from '../store/useNoticeStore';
import { useStudentStore } from '../store/useStudentStore';
import { Chart as ChartJS, Colors, defaults } from 'chart.js/auto';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Plus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  messagesOverTime,
  kpis,
  deliveryBreakdown,
  templateUsage,
} from '../lib/mockData';

// ===== Chart defaults =====
defaults.maintainAspectRatio = false;
defaults.responsive = true;
defaults.plugins.title.display = true;
defaults.plugins.title.align = 'start';
defaults.plugins.title.font.size = 18;
defaults.plugins.title.color = '#111';
defaults.plugins.legend.position = 'bottom';
defaults.elements.line.tension = 0.4;

// ===== Small KPI component =====
const Stat = ({ label, value, sub }) => (
  <div className="rounded-lg border bg-white p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
    {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
  </div>
);

const DashboardPage = () => {
  const { fetchNotices, loading: noticeLoading } = useNoticeStore();
  const { fetchStudents, loading: studentLoading } = useStudentStore();

  useEffect(() => {
    fetchNotices();
    fetchStudents();
  }, [fetchNotices, fetchStudents]);

  const loading = noticeLoading || studentLoading;

  // ===== Delivery stats =====
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);

  const delivered = deliveryBreakdown?.delivered ?? 0;
  const read = deliveryBreakdown?.read ?? 0;
  const failed = deliveryBreakdown?.failed ?? 0;

  // If "read" is not a separate state in your model, keep totalSent = delivered + failed
  // Otherwise you can do: delivered + read + failed
  const totalSent = delivered + failed;

  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const deliveryRate = pct(delivered, totalSent);
  const readRate = pct(read, totalSent);
  const failRate = pct(failed, totalSent);

  // Precompute subtitle strings (avoid template literals directly in JSX props)
  const subSent = `${deliveryRate}% delivered`;
  const subDelivered = `${deliveryRate}% of sent`;
  const subRead = `${readRate}% of sent`;
  const subFailed = `${failRate}% of sent`;

  // ===== Chart data =====
  const lineData = {
    labels: messagesOverTime.map(d => d.date),
    datasets: [
      {
        label: 'Messages',
        data: messagesOverTime.map(d => d.count),
        borderColor: '#064FF0',
        backgroundColor: 'rgba(6,79,240,0.2)',
        pointRadius: 3,
      },
    ],
  };

  const doughnutData = {
    labels: ['Delivered', 'Read', 'Failed'],
    datasets: [
      {
        data: [delivered, read, failed],
        backgroundColor: ['#0088FE', '#00C49F', '#FF8042'],
        borderColor: ['#0088FE', '#00C49F', '#FF8042'],
      },
    ],
  };

  const barData = {
    labels: templateUsage.map(d => d.name),
    datasets: [
      {
        label: 'Count',
        data: templateUsage.map(d => d.count),
        backgroundColor: templateUsage.map((_, i) => Colors[i % Colors.length]),
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/notices/create">
            <Button icon={<Plus className="h-4 w-4" />}>Create Template</Button>
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
          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
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

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <Card>
              <CardHeader><CardTitle>Messages Over Time</CardTitle></CardHeader>
              <CardContent style={{ height: 240 }}>
                <Line data={lineData} options={{ plugins: { title: { text: 'Messages Over Time' } } }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Delivery Breakdown</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setOpenDeliveryModal(true)}>
                  View details
                </Button>
              </CardHeader>
              <CardContent style={{ height: 240 }}>
                <Doughnut data={doughnutData} options={{ plugins: { title: { text: 'Delivery Breakdown' } } }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Template Usage</CardTitle></CardHeader>
              <CardContent style={{ height: 240 }}>
                <Bar data={barData} options={{ plugins: { title: { text: 'Template Usage' } } }} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages / Delivery KPIs (new) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Stat label="Messages Sent" value={totalSent} sub={subSent} />
            <Stat label="Delivered" value={delivered} sub={subDelivered} />
            <Stat label="Read" value={read} sub={subRead} />
            <Stat label="Failed" value={failed} sub={subFailed} />
          </motion.div>

          {/* Delivery Details Modal */}
          {openDeliveryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDeliveryModal(false)} />
              {/* Modal */}
              <div className="relative z-10 w-full max-w-xl rounded-lg bg-white shadow-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Delivery Details</h3>
                  <button
                    onClick={() => setOpenDeliveryModal(false)}
                    className="rounded p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4" style={{ height: 220 }}>
                    <Doughnut
                      data={doughnutData}
                      options={{ plugins: { title: { display: false } } }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Messages Sent" value={totalSent} sub={subSent} />
                    <Stat label="Delivered" value={delivered} sub={subDelivered} />
                    <Stat label="Read" value={read} sub={subRead} />
                    <Stat label="Failed" value={failed} sub={subFailed} />
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr>
                          <th className="py-2">Status</th>
                          <th className="py-2">Count</th>
                          <th className="py-2">% of Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="py-2">Delivered</td><td>{delivered}</td><td>{deliveryRate}%</td></tr>
                        <tr><td className="py-2">Read</td><td>{read}</td><td>{readRate}%</td></tr>
                        <tr><td className="py-2">Failed</td><td>{failed}</td><td>{failRate}%</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                  <Button variant="ghost" onClick={() => setOpenDeliveryModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;

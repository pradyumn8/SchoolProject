import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Mail, MessageSquare, Users, BookOpen } from 'lucide-react';

const StatsCard = ({ title, value, icon, description, trend, trendValue }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h4 className="text-3xl font-bold text-gray-900 mt-1">{value}</h4>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center text-xs">
                <span className={`mr-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </span>
                <span className="text-gray-500">from last week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            title.includes('Email')
              ? 'bg-blue-100'
              : title.includes('SMS')
              ? 'bg-purple-100'
              : title.includes('Student')
              ? 'bg-green-100'
              : 'bg-orange-100'
          }`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NoticeStats = ({ notices = [] }) => {
  const totalNotices = notices.length;

  const emailNotices = notices.filter(
    notice => Array.isArray(notice.sentVia) && notice.sentVia.includes('email')
  ).length;

  const smsNotices = notices.filter(
    notice => Array.isArray(notice.sentVia) && notice.sentVia.includes('sms')
  ).length;

  const uniqueStudentIds = new Set();
  notices.forEach(notice => {
    if (
      notice.recipients?.type === 'individual' &&
      Array.isArray(notice.recipients.targets)
    ) {
      notice.recipients.targets.forEach(id => uniqueStudentIds.add(id));
    }
  });

  const uniqueStudentsNotified = uniqueStudentIds.size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Notices"
        value={totalNotices}
        icon={<BookOpen className="h-6 w-6 text-orange-600" />}
        trend="up"
        trendValue="12%"
      />
      <StatsCard
        title="Email Notifications"
        value={emailNotices}
        icon={<Mail className="h-6 w-6 text-blue-600" />}
        description="Total notices sent via email"
      />
      <StatsCard
        title="SMS Notifications"
        value={smsNotices}
        icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
        description="Total notices sent via SMS"
      />
      <StatsCard
        title="Students Notified"
        value={uniqueStudentsNotified}
        icon={<Users className="h-6 w-6 text-green-600" />}
        description="Unique students receiving notices"
        trend="up"
        trendValue="8%"
      />
    </div>
  );
};

export default NoticeStats;

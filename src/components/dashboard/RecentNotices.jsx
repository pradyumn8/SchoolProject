import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, CheckCircle2, Clock, Mail, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/date';
import Button from '../ui/Button';

const RecentNotices = ({ notices = [] }) => {
  const navigate = useNavigate();

  const recentNotices = [...notices]
    .filter(notice => notice.created instanceof Date)
    .sort((a, b) => b.created.getTime() - a.created.getTime())
    .slice(0, 5);

  const getNoticeTypeIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <Clock className="h-5 w-5 text-secondary-600" />;
      case 'parentMeeting':
        return <Calendar className="h-5 w-5 text-primary-600" />;
      case 'feeDue':
        return <Mail className="h-5 w-5 text-amber-600" />;
      case 'general':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Notices</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          icon={<ExternalLink className="h-4 w-4" />}
          onClick={() => navigate('/notices')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {recentNotices.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No notices found.
            </div>
          ) : (
            recentNotices.map((notice) => (
              <div key={notice.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNoticeTypeIcon(notice.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notice.title}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {notice.content}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>{formatDistanceToNow(notice.created)}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {notice.recipients?.type === 'bulk' && Array.isArray(notice.recipients?.targets)
                        ? `${notice.recipients.targets.length} divisions` 
                        : `${notice.recipients?.targets?.length || 0} students`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentNotices;

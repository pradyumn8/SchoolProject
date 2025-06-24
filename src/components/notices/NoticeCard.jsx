import React from 'react';
import { formatDistanceToNow } from '../../utils/date';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import { Mail, MessageSquare, Clock } from 'lucide-react';

const NoticeCard = ({ notice }) => {
  if (!notice) {
    return null;
  }

  const getNoticeTypeLabel = (type) => {
    switch (type) {
      case 'attendance':
        return 'Attendance';
      case 'parentMeeting':
        return 'Parent Meeting';
      case 'feeDue':
        return 'Fee Due';
      case 'general':
        return 'General';
      default:
        return 'Notice';
    }
  };

  const getNoticeTypeVariant = (type) => {
    switch (type) {
      case 'attendance':
        return 'secondary';
      case 'parentMeeting':
        return 'primary';
      case 'feeDue':
        return 'warning';
      case 'general':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <Badge variant={getNoticeTypeVariant(notice.type)}>
            {getNoticeTypeLabel(notice.type)}
          </Badge>
          <div className="flex items-center text-gray-500 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(notice.created)}
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mt-2">{notice.title}</h3>
        <p className="text-gray-600 mt-1 line-clamp-3">{notice.content}</p>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Sent to:</span>&nbsp;
            <span>
              {notice.recipients?.type === 'bulk'
                ? `${notice.recipients?.targets?.length || 0} ${notice.recipients?.targets?.length === 1 ? 'division' : 'divisions'}`
                : `${notice.recipients?.targets?.length || 0} ${notice.recipients?.targets?.length === 1 ? 'student' : 'students'}`
              }
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {notice.sentVia?.includes('email') && (
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>Email</span>
            </div>
          )}
          {notice.sentVia?.includes('sms') && (
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>SMS</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoticeCard;

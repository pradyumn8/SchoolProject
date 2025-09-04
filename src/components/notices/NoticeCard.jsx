import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../../utils/date';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {useNoticeStore} from '../../store/useNoticeStore.js'
import axios from 'axios';


function NoticeCard({ notice, setNotices  }) {
  const removeNotice = useNoticeStore((s) => s.removeNotice);

  const handleDelete = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/notices/${id}/archive`, {}, { withCredentials: true });
      
      // Update UI immediately
      setNotices((prev) => prev.filter((notice) => notice._id !== id));
    } catch (err) {
      console.error("Error deleting notice", err);
    }
  };


  const navigate = useNavigate();
  if (!notice) return null;

  const getNoticeTypeLabel = (type) => {
    switch (type) {
      case 'attendance': return 'Attendance';
      case 'parentMeeting': return 'Parent Meeting';
      case 'feeDue': return 'Fee Due';
      case 'general': return 'General';
      default: return 'Notice';
    }
  };

  const getNoticeTypeVariant = (type) => {
    switch (type) {
      case 'attendance': return 'secondary';
      case 'parentMeeting': return 'primary';
      case 'feeDue': return 'warning';
      case 'general': return 'success';
      default: return 'primary';
    }
  };

  const handleClick = () => {
    navigate('/notices/send-notice', { state: { notice } });
  };



  return (
    <Card
      onClick={handleClick}
      className="h-full transition-shadow hover:shadow-md cursor-pointer bg-gray-100"
    >
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <Badge variant={getNoticeTypeVariant(notice.type)}>
            {getNoticeTypeLabel(notice.type)}
          </Badge>

          <div className="flex items-center space-x-2 text-gray-500 text-xs">

            <span>
              {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mt-2">{notice.title}</h3>
        <p className="text-gray-600 mt-1 line-clamp-3">{notice.content}</p>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Sent to:</span>&nbsp;
            <span>
              {notice.recipients?.type === 'bulk'
                ? `${notice.recipients?.targets?.length || 0} ${(notice.recipients?.targets?.length === 1) ? 'division' : 'divisions'}`
                : `${notice.recipients?.targets?.length || 0} ${(notice.recipients?.targets?.length === 1) ? 'student' : 'students'}`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoticeCard;
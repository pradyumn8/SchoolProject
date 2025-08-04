import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoticeStore } from '../store/useNoticeStore';
import { useStudentStore } from '../store/useStudentStore';
import NoticeForm from '../components/notices/NoticeForm';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
  
const CreateNoticePage = () => {
  const { addNotice, loading } = useNoticeStore();
  const navigate = useNavigate();

  const handleSubmit = async (noticeData) => {
    try {
      await addNotice(noticeData);
      toast.success('Notice created successfully!');
      navigate('/notices');
    } catch (err) {
      toast.error('Failed to create notice');
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          Let AI help you create and save a new notice template
        </h1>

      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <NoticeForm onSubmit={handleSubmit} isLoading={loading} />
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Tips for Creating Templates</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  We use Google Gemini to generate notice templates
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                 eg. Parents meeting notice (Select required length of words)
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  First 5 templates are generated instantly for a fast experience
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Additional templates (beyond 5) are queued and processed in order
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  You’ll see a “queued” or “in progress” status once you exceed 5
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Adjust your inputs to refine template quality at any time
                </li>
              </ul>
            </div>

          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Notice Types</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm">
                <li>
                  <p className="font-medium text-gray-900">General Notice</p>
                  <p className="text-gray-600">For general announcements and information</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Attendance Notice</p>
                  <p className="text-gray-600">For absence-related communications</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Parent Meeting Notice</p>
                  <p className="text-gray-600">For scheduling parent-teacher meetings</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Fee Due Notice</p>
                  <p className="text-gray-600">For fee payment reminders</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateNoticePage;

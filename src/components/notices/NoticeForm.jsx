import React, { useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { AlertTriangle, Mail, MessageSquare } from 'lucide-react';

const NoticeForm = ({ onSubmit, isLoading = false }) => {
  const { students, divisions } = useStudentStore();

  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    content: '',
    recipientType: 'school',
    divisionId: '',
    targetIds: [],
    email: true,
    sms: false,
  });

  const [errors, setErrors] = useState({});

  const noticeTypeOptions = [
    { value: 'general', label: 'General Notice' },
    { value: 'attendance', label: 'Attendance Notice' },
    { value: 'parentMeeting', label: 'Parent Meeting Notice' },
    { value: 'feeDue', label: 'Fee Due Notice' },
  ];

  const recipientTypeOptions = [
    { value: 'school', label: 'Entire School' },
    { value: 'bulk', label: 'Specific Class/Division' },
    { value: 'individual', label: 'Individual Students' },
  ];

  const divisionOptions = divisions.map(division => ({
    value: division.id.toString(),
    label: `${division.name} - ${division.section}`,
  }));

  const getFilteredStudents = () => {
    if (formData.divisionId) {
      return students.filter(student => student.divisionId === parseInt(formData.divisionId));
    }
    return students;
  };

  const studentOptions = getFilteredStudents().map(student => ({
    value: student.id,
    label: `${student.name} (${student.rollNumber})`,
  }));

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'recipientType' && { targetIds: [] }),
        ...(name === 'divisionId' && { targetIds: [] }),
      }));
    }

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => Number(option.value));
    setFormData(prev => ({ ...prev, targetIds: selectedOptions }));

    if (errors.targetIds) {
      const newErrors = { ...errors };
      delete newErrors.targetIds;
      setErrors(newErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.recipientType === 'bulk' && !formData.divisionId) {
      newErrors.divisionId = 'Please select a class/division';
    }
    if (formData.recipientType === 'individual' && formData.targetIds.length === 0) {
      newErrors.targetIds = 'Please select at least one student';
    }
    if (!formData.email && !formData.sms) {
      newErrors.sentVia = 'Please select at least one sending method';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sentVia = [];
    if (formData.email) sentVia.push('email');
    if (formData.sms) sentVia.push('sms');

    let targets = [];
    if (formData.recipientType === 'school') {
      targets = divisions.map(d => d.id);
    } else if (formData.recipientType === 'bulk') {
      targets = [parseInt(formData.divisionId)];
    } else {
      targets = formData.targetIds;
    }

    onSubmit({
      type: formData.type,
      title: formData.title,
      content: formData.content,
      recipients: {
        type: formData.recipientType,
        targets,
      },
      sentVia,
    });

    setFormData({
      type: 'general',
      title: '',
      content: '',
      recipientType: 'school',
      divisionId: '',
      targetIds: [],
      email: true,
      sms: false,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Notice</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Notice Type"
              name="type"
              options={noticeTypeOptions}
              value={formData.type}
              onChange={(value) => handleChange({ target: { name: 'type', value } })}
              fullWidth
              required
            />

            <Select
              label="Recipients"
              name="recipientType"
              options={recipientTypeOptions}
              value={formData.recipientType}
              onChange={(value) => handleChange({ target: { name: 'recipientType', value } })}
              fullWidth
              required
            />
          </div>

          {formData.recipientType === 'bulk' && (
            <Select
              label="Select Class/Division"
              name="divisionId"
              options={divisionOptions}
              value={formData.divisionId}
              onChange={(value) => handleChange({ target: { name: 'divisionId', value } })}
              error={errors.divisionId}
              fullWidth
              required
            />
          )}

          {formData.recipientType === 'individual' && (
            <div>
              <Select
                label="Filter by Class/Division"
                name="divisionId"
                options={[{ value: '', label: 'All Classes' }, ...divisionOptions]}
                value={formData.divisionId}
                onChange={(value) => handleChange({ target: { name: 'divisionId', value } })}
                fullWidth
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Students
                </label>
                <select
                  multiple
                  size={5}
                  value={formData.targetIds.map(String)}
                  onChange={handleMultiSelectChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {studentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.targetIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetIds}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple students
                </p>
              </div>
            </div>
          )}

          <Input
            label="Notice Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notice title"
            error={errors.title}
            fullWidth
            required
          />

          <Textarea
            label="Notice Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter notice content"
            error={errors.content}
            fullWidth
            required
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Via
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email"
                  name="email"
                  checked={formData.email}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="email" className="ml-2 block text-sm text-gray-700">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms"
                  name="sms"
                  checked={formData.sms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="sms" className="ml-2 block text-sm text-gray-700">
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    SMS
                  </span>
                </label>
              </div>
            </div>
            {errors.sentVia && (
              <p className="mt-1 text-sm text-red-600">{errors.sentVia}</p>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the errors before submitting
                  </h3>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" isLoading={isLoading} fullWidth>
            Send Notice
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NoticeForm;

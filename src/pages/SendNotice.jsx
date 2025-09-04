import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, ArrowLeft, Search, Send } from 'lucide-react';

const SendNotice = ({ onSubmit, isLoading = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notice } = location.state || {};   // ✅ now "notice" is defined

  // Template, student, and division data
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    templateId: '',
    content: '',
    recipientType: 'school',
    divisionId: '',
    targetIds: [],
  });
  const [errors, setErrors] = useState({});

  // Pre-fill when notice exists
  useEffect(() => {
    if (notice) {
      setFormData({
        templateId: notice.templateId || '',
        content: notice.content || '',
        recipientType: notice.recipients?.type || 'school',
        divisionId: notice.recipients?.type === 'bulk' ? notice.recipients?.targets?.[0] : '',
        targetIds: notice.recipients?.type === 'individual' ? notice.recipients?.targets || [] : [],
      });
    }
  }, [notice]);

  // ✅ Drop-in fix: match template after templates load
  useEffect(() => {
    if (!notice || templates.length === 0) return;

    let matched = notice.templateId
      ? templates.find(t => t._id === notice.templateId)
      : null;

    if (!matched && notice.title) {
      const nTitle = notice.title.trim().toLowerCase();
      matched = templates.find(t => (t.title || '').trim().toLowerCase() === nTitle);
    }

    if (matched) {
      setFormData(fd => ({ ...fd, templateId: matched._id }));
    }
  }, [notice, templates]);

  // Load templates from backend
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await axios.get(`${API_URL}/api/notices`);
        setTemplates(res.data);
      } catch (err) {
        toast.error('Could not fetch templates');
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  // Load students and derive divisions
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await axios.get(`${API_URL}/api/students`);
        setStudents(res.data);
        // derive unique divisions
        const map = {};
        res.data.forEach(s => {
          const key = `${s.standard}-${s.divisionId}`;
          if (!map[key]) map[key] = { standard: s.standard, id: s.divisionId };
        });
        setDivisions(Object.values(map));
      } catch (err) {
        toast.error('Could not fetch students');
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  // Options
  const templateOptions = templates.map(t => ({ value: t._id, label: t.title }));
  const recipientOptions = [
    { value: 'school', label: 'Entire School' },
    { value: 'bulk', label: 'Specific Standard' },
    { value: 'individual', label: 'Individual Students' },
  ];
  const divisionOptions = divisions.map(d => ({ value: d.id, label: `${d.standard} ${d.id}` }));
  const filteredStudents = formData.divisionId
    ? students.filter(s => s.divisionId === formData.divisionId)
    : students;
  const studentOptions = filteredStudents.map(s => ({ value: s._id, label: `${s.name}` }));

  // Handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(err => { const e = { ...err }; delete e[name]; return e; });
  };

  const handleSelectChange = (name, value) => {
    setFormData(fd => ({ ...fd, [name]: value, ...(name === 'recipientType' ? { divisionId: '', targetIds: [] } : {}), ...(name === 'divisionId' ? { targetIds: [] } : {}) }));
    setErrors(err => { const e = { ...err }; delete e[name]; return e; });
    if (name === 'templateId') {
      const sel = templates.find(t => t._id === value);
      setFormData(fd => ({ ...fd, content: sel?.content || '' }));
    }
  };

  const handleMultiSelectChange = e => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setFormData(fd => ({ ...fd, targetIds: selected }));
    setErrors(err => { const e = { ...err }; delete e.targetIds; return e; });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const newErr = {};
    if (!formData.templateId) newErr.templateId = 'Please select a template';
    if (!formData.content.trim()) newErr.content = 'Content is required';
    if (formData.recipientType === 'bulk' && !formData.divisionId) newErr.divisionId = 'Please select a division';
    if (formData.recipientType === 'individual' && formData.targetIds.length === 0) newErr.targetIds = 'Please select at least one student';
    setErrors(newErr);
    if (Object.keys(newErr).length) return;

    let targets;
    if (formData.recipientType === 'school') targets = divisions.map(d => d.id);
    else if (formData.recipientType === 'bulk') targets = [formData.divisionId];
    else targets = formData.targetIds;

    const sel = templates.find(t => t._id === formData.templateId);
    onSubmit({ type: 'general', title: sel?.title, content: formData.content, recipients: { type: formData.recipientType, targets } });
    setFormData({ templateId: '', content: '', recipientType: 'school', divisionId: '', targetIds: [] });
  };

  const greeting = useMemo(() => {
    if (formData.recipientType === 'individual' && formData.targetIds.length === 1) {
      const stu = students.find(s => s._id === formData.targetIds[0]);
      return `Dear ${stu?.name || 'Student'},\n\n`;
    }
    if (formData.recipientType === 'bulk' && formData.divisionId) {
      return `Dear Students of ${formData.divisionId},\n\n`;
    }
    // fallback for entire school
    return `Dear All,\n\n`;
  }, [formData.recipientType, formData.targetIds, formData.divisionId, students]);


  return (
    <Card className="w-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>Back</Button>
      </div>
      <CardHeader><CardTitle>Send New Notice</CardTitle></CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          <Select
            label="Template"
            name="templateId"
            options={[{ value: '', label: loadingTemplates ? 'Loading...' : 'Select a template' }, ...templateOptions]}
            value={formData.templateId}
            onChange={val => handleSelectChange('templateId', val)}
            error={errors.templateId}
            fullWidth
            required
          />

          <Select
            label="Recipients"
            name="recipientType"
            options={recipientOptions}
            value={formData.recipientType}
            onChange={val => handleSelectChange('recipientType', val)}
            fullWidth
          />

          {formData.recipientType === 'bulk' && (
            <Select
              label="Select Division"
              name="divisionId"
              options={[{ value: '', label: loadingStudents ? 'Loading...' : 'All Standard & Divisions' }, ...divisionOptions]}
              value={formData.divisionId}
              onChange={val => handleSelectChange('divisionId', val)}
              error={errors.divisionId}
              fullWidth
            />
          )}
          {formData.recipientType === 'individual' && (
            <div>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple students
              </p>

              <label className="block text-sm font-medium mb-1">
                Select Students
              </label>

              {/* Search box */}
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm
                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                multiple
                size={5}
                value={formData.targetIds}
                onChange={handleMultiSelectChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm
                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                {filteredStudents
                  .filter((s) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {`${s.name} (${s.standard || '-'} ${s.divisionId || '-'})`}
                    </option>
                  ))}
              </select>

              {errors.targetIds && (
                <p className="mt-1 text-sm text-red-600">{errors.targetIds}</p>
              )}
            </div>
          )}

          <Textarea
            label="Notice Content"
            name="content"
            // value={`Dear ${formData.content}`}
            value={greeting + formData.content}
            // onChange={handleInputChange}
            onChange={e => {
              // strip out the greeting when the user edits, if you like:
              const raw = e.target.value.replace(greeting, '');
              handleInputChange({ target: { name: 'content', value: raw } });
            }}
            error={errors.content}
            fullWidth
            required
            rows={6}
          />

          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="text-red-800 font-medium">Please fix the errors before submitting</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>

          <Button
            className="w-full flex justify-center 
          items-center gap-2 bg-gradient-to-r from-[#226BFF] 
          to-[#65ADFF] text-white px-4 py-2 rounded-lg 
          curspor-pointer hover:opacity-90 transition-all 
          duration-200" type="submit"
            isLoading={isLoading} fullWidth
            icon={<Send className="h-4 w-4"
            />}>Send Notice</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SendNotice;

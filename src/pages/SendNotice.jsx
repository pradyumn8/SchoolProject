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
  const { notice } = location.state || {};   // ✅ notice is defined

  // Data
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);

  // NEW: standards derived from students; divisions derived per selected standard
  const [standards, setStandards] = useState([]);
  const [divisions, setDivisions] = useState([]);

  // Loading flags
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    templateId: '',
    content: '',
    recipientType: 'school',
    standard: '',
    divisionId: '',
    targetIds: [],
  });
  const [errors, setErrors] = useState({});

  // Prefill from notice
  useEffect(() => {
    if (notice) {
      setFormData({
        templateId: notice.templateId || '',
        content: notice.content || '',
        recipientType: notice.recipients?.type || 'school',
        // If bulk, we have a division target; we'll infer standard once students load
        standard: '',
        divisionId: notice.recipients?.type === 'bulk' ? notice.recipients?.targets?.[0] : '',
        targetIds: notice.recipients?.type === 'individual' ? (notice.recipients?.targets || []) : [],
      });
    }
  }, [notice]);

  // After templates load, match by id or title
  useEffect(() => {
    if (!notice || templates.length === 0) return;

    let matched = notice.templateId
      ? templates.find(t => t._id === notice.templateId)
      : null;

    if (!matched && notice.title) {
      const nTitle = (notice.title || '').trim().toLowerCase();
      matched = templates.find(t => (t.title || '').trim().toLowerCase() === nTitle);
    }

    if (matched) {
      setFormData(fd => ({ ...fd, templateId: matched._id }));
    }
  }, [notice, templates]);

  // Load templates
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await axios.get(`${API_URL}/api/notices`);
        setTemplates(res.data);
      } catch {
        toast.error('Could not fetch templates');
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  // Load students, then derive standards; divisions will be derived when standard changes
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await axios.get(`${API_URL}/api/students`);
        setStudents(res.data || []);

        // Unique standards from students
        const stdSet = new Set(
          (res.data || []).map(s => String(s.standard ?? '').trim()).filter(Boolean)
        );
        setStandards([...stdSet]);

      } catch {
        toast.error('Could not fetch students');
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  // If we prefilled only divisionId (from notice) infer standard from students once loaded
  useEffect(() => {
    if (!students.length) return;
    if (!formData.standard && formData.divisionId) {
      const match = students.find(
        s => String(s.divisionId) === String(formData.divisionId)
      );
      if (match?.standard) {
        setFormData(fd => ({ ...fd, standard: String(match.standard) }));
      }
    }
  }, [students, formData.divisionId, formData.standard]);

  // When standard changes, derive its divisions from students
  useEffect(() => {
    if (!formData.standard) {
      setDivisions([]);
      return;
    }
    const divSet = new Set(
      students
        .filter(s => String(s.standard) === String(formData.standard))
        .map(s => String(s.divisionId))
        .filter(Boolean)
    );
    setDivisions([...divSet].map(id => ({ id, standard: formData.standard })));
  }, [formData.standard, students]);

  // Options
  const templateOptions = templates.map(t => ({ value: t._id, label: t.title }));
  const recipientOptions = [
    { value: 'school', label: 'Entire School' },
    { value: 'bulk', label: 'Specific Standard' },
    { value: 'individual', label: 'Individual Students' },
  ];
  const standardOptions = standards.map(s => ({ value: s, label: `${s}` }));
  const divisionOptions = divisions.map(d => ({ value: d.id, label: `${d.id}` }));

  // Students filtered by selected Standard and Division
  const filteredStudents = students.filter(s => {
    if (formData.standard && String(s.standard) !== String(formData.standard)) return false;
    if (formData.divisionId && String(s.divisionId) !== String(formData.divisionId)) return false;
    return true;
  });

  // Handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(err => { const e2 = { ...err }; delete e2[name]; return e2; });
  };

  const handleSelectChange = (name, value) => {
    setFormData(fd => ({
      ...fd,
      [name]: value,
      ...(name === 'recipientType' ? { standard: '', divisionId: '', targetIds: [] } : {}),
      ...(name === 'standard'      ? { divisionId: '', targetIds: [] } : {}),
      ...(name === 'divisionId'    ? { targetIds: [] } : {}),
    }));
    setErrors(err => { const e2 = { ...err }; delete e2[name]; return e2; });

    if (name === 'templateId') {
      const sel = templates.find(t => t._id === value);
      setFormData(fd => ({ ...fd, content: sel?.content || '' }));
    }
  };

  const handleMultiSelectChange = e => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setFormData(fd => ({ ...fd, targetIds: selected }));
    setErrors(err => { const e2 = { ...err }; delete e2.targetIds; return e2; });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const newErr = {};
    if (!formData.templateId) newErr.templateId = 'Please select a template';
    if (!formData.content.trim()) newErr.content = 'Content is required';

    if (formData.recipientType === 'bulk') {
      if (!formData.standard)   newErr.standard  = 'Please select a standard';
      if (!formData.divisionId) newErr.divisionId = 'Please select a division';
    }
    if (formData.recipientType === 'individual' && formData.targetIds.length === 0) {
      newErr.targetIds = 'Please select at least one student';
    }

    setErrors(newErr);
    if (Object.keys(newErr).length) return;

    // Build targets
    let targets;
    if (formData.recipientType === 'school') {
      // Unique divisionIds across entire school (same as your previous behavior)
      const allDivisionIds = [...new Set(students.map(s => s.divisionId).filter(Boolean))];
      targets = allDivisionIds;
    } else if (formData.recipientType === 'bulk') {
      targets = [formData.divisionId];
    } else {
      targets = formData.targetIds;
    }

    const sel = templates.find(t => t._id === formData.templateId);
    onSubmit({
      type: 'general',
      title: sel?.title,
      content: formData.content,
      recipients: { type: formData.recipientType, targets }
    });

    setFormData({
      templateId: '',
      content: '',
      recipientType: 'school',
      standard: '',
      divisionId: '',
      targetIds: []
    });
  };

  const greeting = useMemo(() => {
    if (formData.recipientType === 'individual' && formData.targetIds.length === 1) {
      const stu = students.find(s => s._id === formData.targetIds[0]);
      return `Dear ${stu?.name || 'Student'},\n\n`;
    }
    if (formData.recipientType === 'bulk' && formData.divisionId) {
      return `Dear Students of Std ${formData.standard} - ${formData.divisionId},\n\n`;
    }
    return `Dear All,\n\n`;
  }, [formData.recipientType, formData.targetIds, formData.divisionId, formData.standard, students]);

  return (
    <Card className="w-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
          Back
        </Button>
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
              label="Select Standard"
              name="standard"
              options={[{ value: '', label: loadingStudents ? 'Loading...' : 'Select Standard' }, ...standardOptions]}
              value={formData.standard}
              onChange={val => handleSelectChange('standard', val)}
              error={errors.standard}
              fullWidth
            />
          )}

          {formData.recipientType === 'bulk' && (
            <Select
              label="Select Division"
              name="divisionId"
              options={[{ value: '', label: formData.standard ? 'Select Division' : 'Select Standard first' }, ...divisionOptions]}
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
                    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            value={greeting + formData.content}
            onChange={e => {
              const raw = e.target.value.startsWith(greeting)
                ? e.target.value.slice(greeting.length)
                : e.target.value;
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
          cursor-pointer hover:opacity-90 transition-all 
          duration-200"
            type="submit"
            isLoading={isLoading} fullWidth
            icon={<Send className="h-4 w-4"
            />}>Send Notice</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SendNotice;

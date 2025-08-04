import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

import Button from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { AlertTriangle, Edit, FileUpIcon, Trash2 } from 'lucide-react';
import { useNoticeStore } from '../../store/useNoticeStore';

const NoticeForm = () => {
  const { addNotice } = useNoticeStore();

  // Template type (fixed 'general' for now)
  const [type] = useState('general');

  // Title (first input) and AI generation
  const [title, setTitle] = useState('');
  const articleLength = [
    { length: 50, text: 'Very Short (50 words)' },
    { length: 100, text: 'Short (100 words)' },
    { length: 150, text: 'Brief (150 words)' },
    { length: 200, text: 'Medium (200 words)' },
    { length: 250, text: 'Medium-Long (250 words)' },
    { length: 300, text: 'Longer Medium (300 words)' },
    { length: 400, text: 'Long (400 words)' },
    { length: 500, text: 'Very Long (500 words)' },
  ];
  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [generating, setGenerating] = useState(false);

  // Content and attachment
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const allowedExts = ['pdf', 'doc', 'docx', 'txt', 'mp4', 'jpg', 'png', 'jpeg', 'webp'];
  const allowedTypes = [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'video/mp4', 'image/jpeg', 'image/png', 'image/webp'
  ];

  // Validation & saving state
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Generate AI content based on title
  const onSubmitArticle = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Title is required for AI generation' });
      return;
    }
    try {
      setGenerating(true);
      const { data } = await axios.post(
        'https://ebr-school-management-sytem.onrender.com/api/ai/generate-article',
        { prompt: `Write a ${selectedLength.text} article on: ${title}`, length: selectedLength.length }
      );
      if (data.success) {
        setContent(data.content);
        setErrors(err => { const e = { ...err }; delete e.content; return e; });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Handle attachment
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(ext) || !allowedTypes.includes(file.type)) {
      setErrors(err => ({
        ...err,
        attachment: "Invalid file type. Please attach a file of type: pdf, doc, docx, txt, mp4, jpg, png, jpeg, webp."
      }));

      return;
    }
    setAttachment(file);
    setAttachmentPreview({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
    setErrors(err => { const e = { ...err }; delete e.attachment; return e; });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErr = {};
    if (!title.trim()) newErr.title = 'Title is required';
    if (!content.trim()) newErr.content = 'Content is required';
    setErrors(newErr);
    if (Object.keys(newErr).length) return;

    try {
      setSaving(true);
      await addNotice({ type, title, content });
      toast.success('Template saved!');
      setTitle(''); setContent(''); setAttachment(null); setAttachmentPreview(null); setErrors({});
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader><CardTitle>Create New Template</CardTitle></CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          {/* Title input (first) */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter the topic of your article"
            className='w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600' required
          />
          {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}

          {/* AI Generation */}
          <button
            type="button"
            onClick={onSubmitArticle}
            disabled={generating}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 rounded-lg curspor-pointer hover:opacity-90 transition-all duration-200"
          >
            {generating
              ? <span className="w-4 h-4 my-1 border-2 border-t-transparent rounded-full animate-spin" />
              : <><Edit className="w-5" /> Generate Article</>}
          </button>

          {/* Length selector */}
          <p className="mt-4 text-sm font-medium">Article Length</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {articleLength.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedLength(opt)}
                className={`text-xs px-4 py-1 border rounded-full transition-colors ${selectedLength.text === opt.text
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
              >{opt.text}</button>
            ))}
          </div>

          {/* Content field */}
          <div className='w-full p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
            <div className='flex items-center gap-3'>
              <Edit className='w-5 h-5 text-[#4A7AFF]' />
              <h1 className='text-xl font-semibold'>Generated Notice</h1>
            </div>
            {/* // Display the generated content */}

            {!content ? (
              <div className='flex-1 flex justify-center items-center'>
                <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                  <Edit className='w-9 h-9' />
                  <p>Enter a topic and click "Generate Notice" to get started</p>
                </div>
              </div>
            ) : (
              <textarea
                className='mt-3 w-full h-[400px] p-3 border border-gray-300 rounded resize-y text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600'
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            )}

          </div>

          {errors.content && <p className="text-red-600 text-sm">{errors.content}</p>}

          {/* Attachment upload */}
          <div className="w-full p-6 bg-white rounded-lg border border-gray-500/30 shadow-[0px_1px_15px_0px] shadow-black/10 text-sm">
            <label
              htmlFor="fileInput"
              className="border-2 border-dotted border-gray-400 p-8 mt-2 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-500 transition"
            >
              <FileUpIcon className="w-9 h-9 text-gray-400" />
              <p className="text-gray-400">
                <span className="text-blue-500 underline">click here</span> to select a file
              </p>
              <input
                type="file"
                id="fileInput"
                name="attachment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {attachmentPreview && (
            <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{attachmentPreview.name}</p>
                <p className="text-xs text-gray-600">{attachmentPreview.size}</p>
              </div>
              <button
                type="button"
                title="Cancel"
                className="p-2 rounded-full hover:bg-red-100 transition text-red-600 focus:ring-2 focus:ring-red-200"
                onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          {errors.attachment && (
            <p className="mt-1 text-sm text-center text-red-600">{errors.attachment}</p>
          )}

          {/* Error banner */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="text-sm font-medium text-red-800">Please fix the errors before submitting</p>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            fullWidth
            disabled={saving}
            isLoading={saving}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 rounded-lg curspor-pointer hover:opacity-90 transition-all duration-200"
          >
            {saving ? <span className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" /> : <><Edit className="w-5" /> Save Notice</>}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NoticeForm;

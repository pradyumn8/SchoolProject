// src/pages/AddStudent.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

export const divisions = [
  { id: 'A', name: 'A', section: 'A' },
  { id: 'B', name: 'B', section: 'B' },
  { id: 'C', name: 'C', section: 'C' },
  { id: 'D', name: 'D', section: 'D' },
];
export const Standard = [
  { name: 'Standard', Standard: 'I' },
  { name: 'Standard', Standard: 'II' },
  { name: 'Standard', Standard: 'III' },
  { name: 'Standard', Standard: 'IV' },
  { name: 'Standard', Standard: 'V' },
  { name: 'Standard', Standard: 'VI' },
  { name: 'Standard', Standard: 'VII' },
  { name: 'Standard', Standard: 'VIII' },
  { name: 'Standard', Standard: 'IX' },
  { name: 'Standard', Standard: 'X' },
];

export default function AddStudent() {
  const navigate = useNavigate();
  const { id } = useParams();                    // undefined for “add”
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    standard: '',
    divisionId: '',
    rollNumber: '',
    contactNumber: '',
    email: '',
    address: '',
    grNumber: ''
  });

  // 1️⃣ If in edit mode, fetch the existing student once
  useEffect(() => {
    if (!isEditing) return;

    axios.get(`https://ebr-school-management-sytem.onrender.com//api/students/${id}`)
      .then(res => {
        const s = res.data;
        setFormData({
          name: s.name || '',
          parentName: s.parentName || '',
          standard: s.standard || '',
          divisionId: s.divisionId || '',
          rollNumber: s.rollNumber || '',
          contactNumber: s.contactNumber || '',
          email: s.email || '',
          address: s.address || '',
          grNumber: s.grNumber || ''
        });
      })
      .catch(err => {
        console.error('Failed to load student:', err);
        toast.error('Could not load student data.');
      });
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  // 2️⃣ Submit: POST if adding, PUT if editing
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditing) {
        res = await axios.put(
          `https://ebr-school-management-sytem.onrender.com//api/students/${id}`,
          formData
        );
        toast.success(res.data.msg || 'Student updated!', { position: 'top-right' });
      } else {
        res = await axios.post(
          'https://ebr-school-management-sytem.onrender.com//api/students',
          formData
        );
        toast.success(res.data.msg || 'Student added!', { position: 'top-right' });
      }
      navigate('/students');
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error(
        err.response?.data?.msg || err.message || 'Something went wrong',
        { position: 'top-right' }
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          {isEditing ? 'Edit Student' : 'Add New Student'}
        </h2>

        <form onSubmit={submitForm} className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name*
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parent's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent's Name*
            </label>
            <input
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              placeholder="Enter parent's name"
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Standard */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard*
            </label>
            <select name="standard" value={formData.standard} onChange={handleChange} required
             className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Standard</option>
              {Standard.map(std => (
                <option key={std.Standard} value={std.Standard}>
                  {std.Standard}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division*
            </label>
            <select
              name="divisionId"
              value={formData.divisionId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Division</option>
              {divisions.map(div => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number*
            </label>
            <input
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. 1"
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number*
            </label>
            <input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Phone number(s)"
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              type="email"
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* G.R. Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              G.R. Number*
            </label>
            <input
              name="grNumber"
              value={formData.grNumber}
              onChange={handleChange}
              placeholder="Enter G.R. Number"
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Address */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address"
              className="w-full border border-gray-300 rounded-lg p-2 h-20"
            />
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-200"
            >
              {isEditing ? 'Update Student' : 'Submit Student Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

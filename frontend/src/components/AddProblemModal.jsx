import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Users, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const AddProblemModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    leetcode_link: '',
    difficulty: 'Easy',
    assigned_to: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/trainer/students');
      setStudents(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.leetcode_link || formData.assigned_to.length === 0) {
      return toast.error('Please fill all fields and select at least one student');
    }

    setLoading(true);
    try {
      await api.post('/problems', formData);
      toast.success('Problem assigned successfully!');
      onSuccess();
      onClose();
      setFormData({ title: '', leetcode_link: '', difficulty: 'Easy', assigned_to: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign problem');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(id)
        ? prev.assigned_to.filter(s => s !== id)
        : [...prev.assigned_to, id]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" /> Assign New Problem
          </h3>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. Two Sum"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LeetCode Link</label>
            <input
              type="url"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="https://leetcode.com/problems/..."
              value={formData.leetcode_link}
              onChange={e => setFormData({ ...formData, leetcode_link: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
            <div className="flex gap-2">
              {['Easy', 'Medium', 'Hard'].map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: diff })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    formData.difficulty === diff
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Assign To Students
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 border border-gray-100 rounded-xl bg-gray-50">
              {students.map(student => (
                <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.assigned_to.includes(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{student.name}</span>
                </label>
              ))}
              {students.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No students found</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {loading ? 'Assigning...' : 'Assign Problem'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;

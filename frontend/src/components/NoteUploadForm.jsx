import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, File, X, Plus, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

const NoteUploadForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      return toast.error('Only PDF and DOCX files are allowed');
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast.error('File size must be less than 10MB');
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!title) return toast.error('Title is required');

    setUploading(true);
    setProgress(10); // Simulated progress Start

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => (p < 90 ? p + 10 : p));
    }, 500);

    try {
      await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(progressInterval);
      setProgress(100);
      toast.success('Note uploaded & text extracted ✓');
      
      setFile(null);
      setTitle('');
      setDescription('');
      if (onSuccess) onSuccess();
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <UploadCloud className="mr-2 text-blue-600" size={20} />
        Upload New Note
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g. Dynamic Programming Core Concepts"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF/DOCX, max 10MB)</label>
          
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <File size={32} className="text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={32} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">Click or drag file to this area to upload</p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF and DOCX only</p>
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex justify-center items-center py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none disabled:opacity-70 transition-colors"
          >
            {uploading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
            {uploading ? 'Processing & Extracting...' : 'Upload Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteUploadForm;

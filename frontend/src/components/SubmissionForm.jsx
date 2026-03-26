import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Loader2, X, ClipboardType, UploadCloud, Image as ImageIcon, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';

const SubmissionForm = ({ problem, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [file, setFile] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(''); // Fallback for URL if needed
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchToken = async () => {
    setLoadingToken(true);
    try {
      const res = await api.get(`/submissions/token/${problem._id}`);
      setToken(res.data.token);
      toast.success('Verification token generated!');
      if (!code) {
        setCode(`// ${res.data.token}\n\n// Paste your solution below...`);
      }
    } catch (error) {
      toast.error('Failed to get token');
    } finally {
      setLoadingToken(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return toast.error('Please paste your code.');
    if (!file && !screenshotUrl) return toast.error('Please upload a screenshot.');

    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append('problem_id', problem._id);
      formData.append('code', code);
      formData.append('token_used', 'SINGLE_LAYER_DEV'); // Placeholder for backend compatibility
      if (file) {
        formData.append('screenshot', file);
      } else {
        formData.append('screenshot_url', screenshotUrl);
      }

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSubmissionResult(res.data);
      toast.success('Submission processed!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Submit Solution</h3>
            <p className="text-sm text-gray-500">{problem.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {submissionResult ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center ${
                submissionResult.verification?.final_status === 'verified' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  submissionResult.verification?.final_status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {submissionResult.verification?.final_status === 'verified' ? <CheckCircle size={32} /> : <X size={32} />}
                </div>
                <h4 className="text-xl font-bold mb-1 capitalize">
                  Submission {submissionResult.verification?.final_status}
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  {submissionResult.verification?.final_status === 'verified' 
                    ? `Great job! You earned ${submissionResult.score.toFixed(1)} points.`
                    : "Some verification checks failed. Review the details below."}
                </p>

                <div className="w-full grid grid-cols-1 gap-3 text-left">
                  {[
                    { label: 'Layer 1: LeetCode OCR Match', status: submissionResult.verification?.ocr_passes || submissionResult.verification?.ocr_passed }
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{check.label}</span>
                      {check.status ? (
                        <span className="text-green-600 flex items-center gap-1 text-xs font-bold uppercase">
                          <CheckCircle size={14} /> Pass
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase">
                          <X size={14} /> Fail
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl"
              >
                Close Dashboard
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-bold ring-red-300">
                    Step 1: Paste Your Code
                  </label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Your solution code here..."
                    rows={8}
                    className="w-full font-mono text-sm p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-bold">
                    Step 2: Upload Accepted Screenshot
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      file ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Ready to verify</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud size={32} className="text-gray-400 mb-3" />
                        <p className="text-sm font-semibold text-gray-900">Click to upload LeetCode screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">Accepts PNG, JPG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                   <button
                     type="submit"
                     disabled={loadingSubmit}
                     className="w-full flex items-center justify-center py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-70 transition-all shadow-xl shadow-gray-200"
                   >
                     {loadingSubmit && <Loader2 size={20} className="animate-spin mr-3" />}
                     Submit for AI Verification
                   </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;

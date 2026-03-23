import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, X, ClipboardType, UploadCloud } from 'lucide-react';
import api from '../api/axiosConfig';

const SubmissionForm = ({ problem, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchToken = async () => {
    setLoadingToken(true);
    try {
      const res = await api.get(`/submissions/token/${problem._id}`);
      setToken(res.data.token);
      toast.success('Verification token generated!');
      
      // Auto-insert token comment into code area if empty or if requested
      if (!code) {
        setCode(`// ${res.data.token}\n\n// Paste your solution below...`);
      }
    } catch (error) {
      toast.error('Failed to get token');
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('You must generate a verification token first.');
    if (!code) return toast.error('Please paste your code.');
    if (!screenshotUrl) return toast.error('Please provide a screenshot URL/Base64.'); // Spec says screenshot_url

    // Simple check if token is in code
    if (!code.includes(token)) {
      toast.error('Warning: Your token is not present in the code comments. Verification might fail.');
    }

    setLoadingSubmit(true);
    try {
      await api.post('/submissions', {
        problem_id: problem._id,
        code,
        screenshot_url: screenshotUrl,
        token_used: token
      });
      toast.success('Submission sent for verification!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg">Submit Solution: {problem.title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-md">
             <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Step 1: Token */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <ClipboardType size={16} className="mr-2" /> Step 1: Get Verification Token
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              Generate a unique token and include it as a comment in your code before taking the screenshot.
            </p>
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchToken}
                disabled={loadingToken || !!token}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingToken ? <Loader2 size={16} className="animate-spin" /> : 'Generate Token'}
              </button>
              {token && <span className="font-mono bg-white px-3 py-1.5 border border-blue-200 rounded font-bold text-blue-700">{token}</span>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Enter token here..."
                rows={8}
                className="w-full font-mono text-sm p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Screenshot (Base64 or external URL for free tier)</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  <UploadCloud size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://imgur.com/... or data:image/png;base64,..."
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
               <button
                 type="submit"
                 disabled={loadingSubmit}
                 className="flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70 transition-colors"
               >
                 {loadingSubmit ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                 Submit for Verification
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;

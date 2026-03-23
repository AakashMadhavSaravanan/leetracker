import React from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

const ProblemCard = ({ problem, role, status, submissionScore, onAssign, onSubmit }) => {
  const diffColor = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700'
  };

  const statusConfig = {
    verified: { icon: <CheckCircle className="text-green-500" size={18} />, text: 'Verified', color: 'text-green-600' },
    rejected: { icon: <XCircle className="text-red-500" size={18} />, text: 'Rejected', color: 'text-red-600' },
    pending: { icon: <Clock className="text-yellow-500" size={18} />, text: 'Pending Ver.', color: 'text-yellow-600' },
    unsolved: { icon: <span className="w-4 h-4 rounded-full border-2 border-gray-300" />, text: 'Unsolved', color: 'text-gray-500' }
  };

  const currentStatus = statusConfig[status || 'unsolved'];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-900 leading-tight">
          {problem.title}
        </h4>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${diffColor[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex-1">
        <a 
          href={problem.leetcode_link} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>View on LeetCode</span>
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {role === 'student' ? (
          <>
            <div className={`flex flex-col text-sm`}>
              <div className={`flex items-center space-x-1 ${currentStatus.color}`}>
                {currentStatus.icon}
                <span className="font-medium">{currentStatus.text}</span>
              </div>
              {submissionScore !== undefined && status === 'verified' && (
                <span className="text-xs text-gray-500 mt-0.5">Score: {submissionScore.toFixed(1)}</span>
              )}
            </div>
            
            {status !== 'verified' && status !== 'pending' && (
              <button 
                onClick={() => onSubmit(problem)}
                className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Submit UI
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-500 mt-1">
              Assigned to: {problem.assigned_to?.length || 0} students
            </span>
            <button 
              onClick={() => onAssign(problem)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              Assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;

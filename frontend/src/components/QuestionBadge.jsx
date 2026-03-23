import React from 'react';
import { ExternalLink } from 'lucide-react';

const QuestionBadge = ({ question }) => {
  const diffColor = {
    Easy: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Hard: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className={`border p-3 rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all ${diffColor[question.difficulty || 'Easy']}`}>
      <div>
        <h5 className="font-semibold text-gray-900">{question.title || 'Practice Problem'}</h5>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${diffColor[question.difficulty || 'Easy']}`}>
          {question.difficulty}
        </span>
      </div>
      <a
        href={question.leetcode_link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition-colors"
      >
        <span>Solve</span>
        <ExternalLink size={12} />
      </a>
    </div>
  );
};

export default QuestionBadge;

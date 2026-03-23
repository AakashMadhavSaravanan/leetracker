import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const NoteCard = ({ note, isActive, onClick, role }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const isCompleted = note.completed_by && user && note.completed_by.includes(user.id);

  return (
    <div 
      onClick={() => onClick(note)}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isActive 
          ? 'bg-blue-50 border-l-4 border-l-blue-600' 
          : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          <div className={`mt-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            <FileText size={18} />
          </div>
          <div>
            <h4 className={`font-medium text-sm line-clamp-2 ${isActive ? 'text-blue-900' : 'text-gray-800'}`}>
              {note.title}
            </h4>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">{note.file_type}</span>
              {role === 'trainer' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${note.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {note.is_published ? 'Published' : 'Draft'}
                </span>
              )}
            </div>
          </div>
        </div>
        {role === 'student' && isCompleted && (
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default NoteCard;

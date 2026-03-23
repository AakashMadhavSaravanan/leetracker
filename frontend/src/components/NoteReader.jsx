import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Check, X, FileText, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import QuestionBadge from './QuestionBadge';

const NoteReader = ({ noteId, role, onComplete }) => {
  const [note, setNote] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  
  // Highlight selection state
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedTextData, setSelectedTextData] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (noteId) {
      fetchNoteDetail();
    }
  }, [noteId]);

  const fetchNoteDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notes/${noteId}`);
      setNote(res.data.note);
      setQuestions(res.data.questions);
    } catch (error) {
      toast.error('Failed to load note details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.patch(`/notes/${note._id}/complete`);
      setNote({ ...note, completed_by: [...(note.completed_by || []), user?.id] });
      toast.success('Marked as complete!');
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Failed to mark complete');
    }
  };

  // Text Selection and Highlighting logic
  const handleMouseUp = () => {
    if (role !== 'student') return; // Only students highlight

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim() === '') {
      setSelectionBox(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    // Calculate relative offsets (simplified implementation)
    // To properly support text offsets, we would traverse DOM nodes.
    // Let's use simplified selection logic for UI demonstration.

    setSelectionBox({
      top: rect.top - containerRect.top - 40,
      left: rect.left - containerRect.left + (rect.width / 2) - 60,
    });
    
    // Save minimal data for API
    setSelectedTextData({
      text: selection.toString(),
      start_offset: 0, // Placeholder
      end_offset: selection.toString().length,
    });
  };

  const saveHighlight = async (color) => {
    if (!selectedTextData) return;
    
    try {
      const res = await api.post(`/notes/${note._id}/highlight`, {
        text: selectedTextData.text,
        start_offset: selectedTextData.start_offset,
        end_offset: selectedTextData.end_offset,
        color
      });
      
      setNote({
        ...note,
        highlights: [...(note.highlights || []), res.data]
      });
      
      toast.success('Highlight saved');
      setSelectionBox(null);
      window.getSelection().removeAllRanges();
    } catch (error) {
      toast.error('Failed to save highlight');
    }
  };

  const renderContentWithHighlights = () => {
    if (!note.content_text) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
           <FileText size={48} className="mb-4 text-gray-300" />
           <p>No text content available.</p>
           <a href={note.file_url} target="_blank" rel="noreferrer" className="mt-4 text-blue-600 hover:underline">
             View Original File
           </a>
        </div>
      );
    }

    // Advanced: We would inject `<mark>` tags into `note.content_text` based on offsets.
    // For this prototype, we'll render the text with whitespace preserved.
    // And render saved highlights at the bottom or inline if we implemented complex string replacement.
    
    return (
      <div 
        ref={contentRef}
        className="prose max-w-none text-gray-800 relative select-text"
        onMouseUp={handleMouseUp}
        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
      >
        {note.content_text}

        {/* Highlight Popover */}
        {selectionBox && (
          <div 
            className="absolute z-10 bg-gray-900 border border-gray-700 shadow-xl rounded-md flex space-x-1 p-1.5"
            style={{ top: selectionBox.top, left: selectionBox.left }}
          >
            {['#FEF08A', '#BBF7D0', '#FECDD3', '#BFDBFE'].map(color => (
              <button 
                key={color}
                onClick={(e) => { e.stopPropagation(); saveHighlight(color); }}
                className="w-6 h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading || !note) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-80 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  const isCompleted = note.completed_by?.includes(user?.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-start flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{note.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="uppercase tracking-wider font-semibold">{note.file_type}</span>
            <span>•</span>
            <span>By {note.created_by?.name || 'Trainer'}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <a
            href={note.file_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
          >
            Download Original
          </a>
          
          {role === 'student' && (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCompleted 
                  ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <CheckCircle size={18} />
              <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative bg-gray-50/30">
        {renderContentWithHighlights()}
        
        {/* Render saved highlights if any (since standard text isn't inline injected) */}
        {role === 'student' && note.highlights?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Pencil size={16} className="mr-2" /> Your Highlights
            </h4>
            <div className="space-y-2">
              {note.highlights.map(hl => (
                <div key={hl._id} className="p-3 bg-white border border-gray-100 shadow-sm rounded-lg" style={{ borderLeftColor: hl.color, borderLeftWidth: '4px' }}>
                  <p className="text-sm italic">"{hl.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Practice Problems Section */}
      {questions.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Practice Problems</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map(q => (
              <QuestionBadge key={q._id} question={q} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteReader;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Users, Send } from 'lucide-react';
import api from '../api/axiosConfig';
import NoteUploadForm from '../components/NoteUploadForm';
import NoteCard from '../components/NoteCard';

const TrainerNotes = () => {
  const [notes, setNotes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  
  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Question form state
  const [qLink, setQLink] = useState('');
  const [qTitle, setQTitle] = useState('');
  const [qDiff, setQDiff] = useState('Easy');

  useEffect(() => {
    fetchNotes();
    fetchStudents();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      setNotes(res.data);
      // Update selected note if it exists
      if (selectedNote) {
        const updated = res.data.find(n => n._id === selectedNote._id);
        if (updated) setSelectedNote(updated);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/leaderboard'); // Quick way to get all students
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePublish = async (note) => {
    try {
      await api.patch(`/notes/${note._id}/publish`);
      toast.success(note.is_published ? 'Note unpublished' : 'Note published ✓');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  const handleAssign = async () => {
    if (!selectedNote || selectedStudents.length === 0) return;
    try {
      await api.patch(`/notes/${selectedNote._id}/assign`, { studentIds: selectedStudents });
      toast.success('Assigned successfully');
      setShowAssignModal(false);
      setSelectedStudents([]);
      fetchNotes();
    } catch (error) {
      toast.error('Failed to assign note');
    }
  };

  const addQuestionToNote = async (e) => {
    e.preventDefault();
    if (!selectedNote || !qLink) return;
    try {
      await api.post(`/notes/${selectedNote._id}/questions`, {
        leetcode_link: qLink, title: qTitle, difficulty: qDiff
      });
      toast.success('Question added');
      setQLink(''); setQTitle(''); setQDiff('Easy');
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
         <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar: Note List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Learning Materials</h2>
          <button 
            onClick={() => { setShowUpload(true); setSelectedNote(null); }}
            className="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic text-sm">No notes uploaded yet.</div>
          ) : (
            notes.map(note => (
              <NoteCard 
                key={note._id} 
                note={note} 
                role="trainer"
                isActive={selectedNote?._id === note._id && !showUpload}
                onClick={(n) => { setSelectedNote(n); setShowUpload(false); }}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {showUpload ? (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <NoteUploadForm onSuccess={() => { fetchNotes(); setShowUpload(false); }} />
          </div>
        ) : selectedNote ? (
          <div className="p-8 overflow-y-auto space-y-8 h-full custom-scrollbar">
            
            {/* Note Details Header */}
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedNote.title}</h1>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => togglePublish(selectedNote)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedNote.is_published 
                        ? 'border-red-200 text-red-700 hover:bg-red-50' 
                        : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {selectedNote.is_published ? 'Unpublish' : 'Publish Note'}
                  </button>
                  <button 
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Users size={16} className="mr-2" /> Assign
                  </button>
                </div>
              </div>
              <p className="text-gray-500 mt-2">{selectedNote.description || 'No description provided.'}</p>
              
              <div className="mt-6 flex items-center space-x-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">File Type</p>
                  <p className="font-medium">{selectedNote.file_type.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Assigned To</p>
                  <p className="font-medium">{selectedNote.assigned_to?.length || 0} students</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Completed By</p>
                  <p className="font-medium">{selectedNote.completed_by?.length || 0} students</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Text Extracted</p>
                  <p className="font-medium">{selectedNote.content_text ? 'Yes ✓' : 'No ✗'}</p>
                </div>
              </div>
              
              <div className="mt-4">
                 <a href={selectedNote.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                   View Original File →
                 </a>
              </div>
            </div>

            {/* Questions Management */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Practice Problems</h3>
              
              <form onSubmit={addQuestionToNote} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">LeetCode URL</label>
                  <input type="url" required value={qLink} onChange={e => setQLink(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="https://leetcode.com/problems/..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
                  <input type="text" value={qTitle} onChange={e => setQTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Two Sum" />
                </div>
                <div className="flex space-x-2">
                  <select value={qDiff} onChange={e => setQDiff(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                  <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 transition-colors">Add</button>
                </div>
              </form>
              
              <div className="text-sm text-gray-500">
                To view added questions, check the note in Student view or fetch via `/api/notes/:id/questions`.
              </div>
            </div>

            {/* Extracted Text Preview */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Extracted Text Preview</h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-sm font-mono text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {selectedNote.content_text || 'No text content available to preview.'}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <Send size={48} className="text-gray-200" />
            <p>Select a note from the sidebar or upload a new one.</p>
          </div>
        )}
      </div>

      {/* Assign Modal Overlay */}
      {showAssignModal && selectedNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-4">Assign "{selectedNote.title}"</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2 mb-4 space-y-2">
              {students.map(s => {
                const isAssigned = selectedNote.assigned_to?.includes(s.id);
                const isSelected = selectedStudents.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      disabled={isAssigned}
                      checked={isAssigned || isSelected} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                        else setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={isAssigned ? "text-gray-400" : "text-gray-800"}>
                      {s.name} {isAssigned && "(Already assigned)"}
                    </span>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowAssignModal(false); setSelectedStudents([]); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
              <button 
                onClick={handleAssign} 
                disabled={selectedStudents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerNotes;

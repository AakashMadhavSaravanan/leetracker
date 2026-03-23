import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, Send, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import NoteCard from '../components/NoteCard';
import NoteReader from '../components/NoteReader';

const StudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchNotes('');
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNotes = async (query) => {
    try {
      if (query) setSearching(true);
      else setLoading(true);

      const endpoint = query ? `/notes/search?q=${encodeURIComponent(query)}` : '/notes';
      const res = await api.get(endpoint);
      setNotes(res.data);
      
      // Auto-select first note if none selected and not searching
      if (!query && res.data.length > 0 && !selectedNote) {
        setSelectedNote(res.data[0]);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many search requests. Please wait a moment.');
      } else {
        toast.error('Failed to load notes');
      }
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const currentIndex = notes.findIndex(n => n._id === selectedNote?._id);
  const hasNext = currentIndex >= 0 && currentIndex < notes.length - 1;
  const hasPrev = currentIndex > 0;

  const navigateNote = (direction) => {
    if (direction === 'next' && hasNext) setSelectedNote(notes[currentIndex + 1]);
    if (direction === 'prev' && hasPrev) setSelectedNote(notes[currentIndex - 1]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar: Note List with Search */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center">
            <BookOpen size={18} className="mr-2 text-blue-600" /> My Learning Materials
          </h2>
          <div className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            {searching && <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-blue-600" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && !searching ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : notes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic text-sm">
              {searchQuery ? 'No notes matched your search.' : 'No notes assigned yet.'}
            </div>
          ) : (
            notes.map(note => (
              <NoteCard 
                key={note._id} 
                note={note} 
                role="student"
                isActive={selectedNote?._id === note._id}
                onClick={(n) => setSelectedNote(n)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Breadcrumb & Navigation */}
            <div className="mb-4 flex justify-between items-center px-2">
              <div className="text-sm font-medium text-gray-500 tracking-wide">
                <span className="cursor-pointer hover:text-gray-900" onClick={() => setSelectedNote(null)}>Notes</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900">{selectedNote.title}</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigateNote('prev')}
                  disabled={!hasPrev}
                  className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => navigateNote('next')}
                  disabled={!hasNext}
                  className="p-1.5 bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Render selected note with NoteReader */}
            <NoteReader 
              noteId={selectedNote._id} 
              role="student" 
              // Remount component if note changes completely to fetch details correctly
              key={selectedNote._id}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 space-y-4">
            <BookOpen size={48} className="text-gray-200" />
            <p>Select a learning manual to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotes;

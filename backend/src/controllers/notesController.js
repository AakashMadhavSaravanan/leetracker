import Note from '../models/Note.js';
import NoteQuestion from '../models/NoteQuestion.js';
import User from '../models/User.js';
import { extractContent } from '../services/extractionService.js';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configured in app.js or here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file; // From multer memory storage

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const fileExt = file.originalname.split('.').pop().toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'docx') {
      return res.status(400).json({ message: 'Only pdf and docx files are supported' });
    }

    const fileBase64 = file.buffer.toString('base64');

    // 1. Send to Extraction Service
    let extractedText = '';
    try {
      const extractResult = await extractContent({
        file_base64: fileBase64,
        file_type: fileExt,
        filename: file.originalname
      });
      if (extractResult.success) {
        extractedText = extractResult.content_text.substring(0, 50000); // hard limit from spec
      }
    } catch (err) {
      console.error('Text extraction failed, continuing without text.', err.message);
    }

    // 2. Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', format: fileExt },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
        }

        const note = new Note({
          title,
          description: description || '',
          file_url: result.secure_url,
          file_type: fileExt,
          content_text: extractedText,
          created_by: req.user._id
        });

        await note.save();

        res.status(201).json(note);
      }
    );

    // End stream
    uploadStream.end(file.buffer);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    let notes;
    if (req.user.role === 'trainer') {
      notes = await Note.find().populate('assigned_to', 'name email').populate('created_by', 'name');
    } else {
      notes = await Note.find({
        assigned_to: req.user._id,
        is_published: true
      }).populate('created_by', 'name');
    }
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id).populate('created_by', 'name');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permissions
    if (req.user.role !== 'trainer') {
      if (!note.is_published || !note.assigned_to.map(i => i.toString()).includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    // Include only current student's highlights or all if trainer
    const noteObj = note.toObject();
    if (req.user.role === 'student') {
      noteObj.highlights = note.highlights.filter(h => h.user_id.toString() === req.user._id.toString());
    }

    const noteQuestions = await NoteQuestion.findOne({ note_id: id });

    res.json({ note: noteObj, questions: noteQuestions ? noteQuestions.questions : [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const currentAssigned = note.assigned_to.map(i => i.toString());
    studentIds.forEach(studentId => {
      if (!currentAssigned.includes(studentId)) {
        note.assigned_to.push(studentId);
      }
    });

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const publishNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.is_published = !note.is_published;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const completeNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.completed_by.includes(req.user._id)) {
      note.completed_by.push(req.user._id);
      await note.save();
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const highlightNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, start_offset, end_offset, color } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const newHighlight = {
      user_id: req.user._id,
      text,
      start_offset,
      end_offset,
      color: color || '#FDE68A'
    };

    note.highlights.push(newHighlight);
    await note.save();

    res.status(201).json(note.highlights[note.highlights.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeHighlight = async (req, res) => {
  try {
    const { id, hlId } = req.params;
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.highlights = note.highlights.filter(h => h._id.toString() !== hlId || h.user_id.toString() !== req.user._id.toString());
    
    await note.save();
    res.json({ message: 'Highlight removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const query = { $text: { $search: q } };
    
    if (req.user.role === 'student') {
      query.is_published = true;
      query.assigned_to = req.user._id;
    }

    const notes = await Note.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addQuestionToNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { leetcode_link, title, difficulty, order } = req.body;

    let noteQuestion = await NoteQuestion.findOne({ note_id: id });
    if (!noteQuestion) {
      noteQuestion = new NoteQuestion({ note_id: id, questions: [] });
    }

    noteQuestion.questions.push({
      leetcode_link,
      title: title || '',
      difficulty,
      order: order || 0
    });

    await noteQuestion.save();
    res.status(201).json(noteQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuestionsForNote = async (req, res) => {
  try {
    const { id } = req.params;
    const noteQuestion = await NoteQuestion.findOne({ note_id: id });
    res.json(noteQuestion ? noteQuestion.questions : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeQuestionFromNote = async (req, res) => {
  try {
    const { id, qId } = req.params;
    
    const noteQuestion = await NoteQuestion.findOne({ note_id: id });
    if (!noteQuestion) {
      return res.status(404).json({ message: 'Questions not found for note' });
    }

    noteQuestion.questions = noteQuestion.questions.filter(q => q._id.toString() !== qId);
    await noteQuestion.save();

    res.json({ message: 'Question removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

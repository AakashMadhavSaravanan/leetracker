import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { searchRateLimiter } from '../middleware/rateLimiter.js';
import {
  uploadNote,
  getNotes,
  getNoteById,
  assignNote,
  publishNote,
  completeNote,
  highlightNote,
  removeHighlight,
  searchNotes,
  addQuestionToNote,
  getQuestionsForNote,
  removeQuestionFromNote
} from '../controllers/notesController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(verifyToken);

router.post('/', requireRole('trainer'), upload.single('file'), uploadNote);
router.get('/search', searchRateLimiter, searchNotes);
router.get('/', getNotes);
router.get('/:id', getNoteById);

router.patch('/:id/assign', requireRole('trainer'), assignNote);
router.patch('/:id/publish', requireRole('trainer'), publishNote);

router.patch('/:id/complete', requireRole('student'), completeNote);
router.post('/:id/highlight', requireRole('student'), highlightNote);
router.delete('/:id/highlight/:hlId', requireRole('student'), removeHighlight);

router.post('/:id/questions', requireRole('trainer'), addQuestionToNote);
router.get('/:id/questions', getQuestionsForNote);
router.delete('/:id/questions/:qId', requireRole('trainer'), removeQuestionFromNote);

export default router;

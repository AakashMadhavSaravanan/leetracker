import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getToken, submitSolution, getMySubmissions, getAllSubmissions } from '../controllers/submissionController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/token/:problemId', requireRole('student'), getToken);
router.post('/', requireRole('student'), submitSolution);
router.get('/mine', requireRole('student'), getMySubmissions);
router.get('/all', requireRole('trainer'), getAllSubmissions);

export default router;

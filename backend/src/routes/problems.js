import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { createProblem, getProblems, assignProblem } from '../controllers/problemController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', requireRole('trainer'), createProblem);
router.get('/', getProblems);
router.patch('/:id/assign', requireRole('trainer'), assignProblem);

export default router;

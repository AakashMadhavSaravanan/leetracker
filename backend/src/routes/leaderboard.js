import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', getLeaderboard);

export default router;

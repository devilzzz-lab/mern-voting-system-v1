import express from 'express';
import { voteUser, getVoteStats, checkIfVoted, submitVote } from '../controllers/voteController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

// Voting route - accessible only if election is active and the user is authenticated
router.post('/', authMiddleware(), voteUser);
router.get('/stats', authAdmin(), getVoteStats);
router.get('/check', authMiddleware(), checkIfVoted);
router.post('/', authMiddleware, submitVote); // ⬅ Accepts descriptor in req.body

export default router;

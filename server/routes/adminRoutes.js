import express from 'express';
import { startElection, stopElection, getElectionState } from '../controllers/electionController.js';
import { loginAdmin } from '../controllers/adminController.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

// Public route: Admin logs in using identifier + password
router.post('/login', loginAdmin);

// Private routes: Protected with token-based admin middleware
router.post('/start', authAdmin(), startElection);
router.post('/end', authAdmin(), stopElection);
router.get('/state', authAdmin(), getElectionState);

export default router;

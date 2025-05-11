import express from 'express';
import {
  startElection,
  stopElection,
  getElectionState,
  getPublicElectionState, // ✅ add this
} from '../controllers/electionController.js';
import { loginAdmin } from '../controllers/adminController.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

// Public route: Admin login
router.post('/login', loginAdmin);

// Public route: Get election state (no token required) ✅
router.get('/public-state', getPublicElectionState);

// Protected admin routes
router.get('/state', authAdmin(), getElectionState);
router.post('/start', authAdmin(), startElection);
router.post('/end', authAdmin(), stopElection);

export default router;

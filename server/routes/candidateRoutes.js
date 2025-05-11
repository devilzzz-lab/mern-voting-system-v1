// routes/candidateRoutes.js
import express from 'express';
import authAdmin from '../middleware/authAdmin.js';
import { addCandidate, loginCandidate, getAllCandidates } from '../controllers/candidateController.js';

const router = express.Router();

// Route to add a candidate, restricted to admins only
router.post('/add-candidate', authAdmin(), addCandidate);

// Route for candidate login
router.post('/login', loginCandidate);  // <-- Add this route

// ✅ Get all candidates (for any user, no role-based restriction)
router.get('/', getAllCandidates); 

export default router;

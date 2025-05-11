// routes/userRoutes.js
import express from 'express';
import { loginUser, registerUser, getUserById} from '../controllers/userController.js';
import { voteUser } from '../controllers/voteController.js';
import authMiddleware from '../middleware/authMiddleware.js';  // Import the middleware

const router = express.Router();

// Protect the vote route so only authenticated users or candidates can vote
router.post('/vote', authMiddleware(), voteUser);  // No specific role, any authenticated user can vote

// User login and registration routes (no authentication needed here for login)
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/:id', getUserById);  // 👈 Add this GET route for fetching user by ID

export default router;

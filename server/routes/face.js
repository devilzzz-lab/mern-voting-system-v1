import express from 'express';
import { saveFaceDescriptor, verifyFaceDescriptor, getFaceDescriptorByUserId } from '../controllers/faceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticated user can save face descriptor
router.post('/save', saveFaceDescriptor);
router.post('/verify',verifyFaceDescriptor);
router.get('/descriptor/:userId', authMiddleware, getFaceDescriptorByUserId);

export default router;

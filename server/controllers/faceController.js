// utils/faceutils.js

import FaceDescriptor from '../models/FaceDescriptor.js';
import User from '../models/User.js';
import { compareDescriptors, cosineSimilarity } from '../utils/faceRecognitionUtils.js';

// Save Face Descriptor
export const saveFaceDescriptor = async (req, res) => {
  try {
    const { descriptor, userId } = req.body;
    console.log(`[saveFaceDescriptor] Received request for userId: ${userId}`);

    if (!Array.isArray(descriptor) || descriptor.some(d => typeof d !== 'number')) {
      console.warn(`[saveFaceDescriptor] Invalid descriptor format:`, descriptor);
      return res.status(400).json({ message: 'Invalid face descriptor format. Must be an array of numbers.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[saveFaceDescriptor] User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check for duplicate descriptors in other accounts
    const allDescriptors = await FaceDescriptor.find({ userId: { $ne: userId } });
    for (const entry of allDescriptors) {
      const similarity = cosineSimilarity(descriptor, entry.descriptor);
      if (similarity > 0.5) {
        const matchedUser = await User.findById(entry.userId);
        let identity = matchedUser?.aadhaar || matchedUser?.email || matchedUser?.phone || 'another user';
        console.warn(`[saveFaceDescriptor] Duplicate face detected. Matches with: ${identity}`);
        return res.status(409).json({
          message: `This face is already registered with another account (${identity}).`,
          matchedUserId: entry.userId,
          identity,
        });
      }
    }

    // Save or update face descriptor
    let existingDescriptor = await FaceDescriptor.findOne({ userId });
    if (existingDescriptor) {
      existingDescriptor.descriptor = descriptor;
      await existingDescriptor.save();
      console.log(`[saveFaceDescriptor] Updated descriptor for userId: ${userId}`);
    } else {
      await FaceDescriptor.create({ userId, descriptor });
      console.log(`[saveFaceDescriptor] Created new descriptor for userId: ${userId}`);
    }

    res.status(200).json({ message: 'Face descriptor saved successfully.' });

  } catch (err) {
    console.error(`[saveFaceDescriptor] Error:`, err);
    res.status(500).json({ message: 'Failed to save face descriptor.' });
  }
};

// Verify Face Descriptor
export const verifyFaceDescriptor = async (req, res) => {
  const { userId, descriptors } = req.body;

  if (!userId || !descriptors) {
    return res.status(400).json({ success: false, message: 'User ID and descriptors are required.' });
  }

  try {
    const storedDescriptor = await FaceDescriptor.findOne({ userId });

    if (!storedDescriptor) {
      return res.status(404).json({ success: false, message: 'User not found or face descriptor not registered.' });
    }

    const match = compareDescriptors(storedDescriptor.descriptor, descriptors);

    if (match) {
      return res.status(200).json({ success: true, message: 'Face verified successfully!' });
    } else {
      return res.status(400).json({ success: false, message: 'Face verification failed.' });
    }
  } catch (error) {
    console.error('Error during face verification:', error);
    return res.status(500).json({ success: false, message: 'An error occurred during verification.' });
  }
};

// Admin-only: Fetch descriptor for user
export const getFaceDescriptorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const record = await FaceDescriptor.findOne({ userId });

    if (!record) {
      return res.status(404).json({ message: 'Face descriptor not found.' });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching face descriptor:', error);
    res.status(500).json({ message: 'Failed to fetch face descriptor.' });
  }
};

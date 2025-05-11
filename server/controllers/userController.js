// controllers/userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import FaceDescriptor from '../models/FaceDescriptor.js'; // Correct model name

// LOGIN
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  console.log("⏩ User Login Attempt");
  console.log("📥 Received Identifier:", identifier);
  console.log("📥 Received Password:", password);

  try {
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { aadharNumber: identifier }
      ]
    });

    if (!user) {
      console.log("❌ User not found with given identifier");
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect password");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log("🎟️ JWT Token Payload:", { userId: user._id.toString(), role: user.role || 'user' });
    console.log("🔐 Token:", token);    

    console.log("✅ Login successful");
    res.status(200).json({ token });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, aadharNumber, phoneNumber, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ aadharNumber }, { phoneNumber }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      aadharNumber,
      phoneNumber,
      email,
      password,
      role: role || 'user'
    });

    await newUser.save();

    // ✅ Return userId in response
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(id).select('-password'); // Don't return password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
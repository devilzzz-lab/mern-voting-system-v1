// controllers/candidateController.js
import Candidate from '../models/Candidate.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Admin adds a candidate
export const addCandidate = async (req, res) => {
  const { name, party, email, password, aadhaar, phone } = req.body;

  if (!name || !party || !email || !password || !aadhaar || !phone) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    // Check if the candidate already exists by email, Aadhaar, or phone
    const exists = await Candidate.findOne({ $or: [{ email }, { aadhaar }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: 'Candidate with this email, Aadhaar, or phone already exists' });
    }

    // Create a new candidate instance
    const candidate = new Candidate({
      name,
      party,
      email,
      password, // Password hashing will be handled by the Mongoose model middleware
      aadhaar,
      phone
    });

    // Save candidate to the database
    await candidate.save();
    res.status(201).json({ message: 'Candidate added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding candidate' });
  }
};

// Candidate login
export const loginCandidate = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const candidate = await Candidate.findOne({
      $or: [
        { email: identifier },
        { phone: identifier },
        { aadhaar: identifier }
      ]
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: candidate._id, role: 'candidate' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Candidate login error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({}, '-password');
    return res.status(200).json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    return res.status(500).json({ message: 'Failed to fetch candidates' });
  }
};
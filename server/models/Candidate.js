import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  aadhaar: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash password before saving
candidateSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to generate auth token
candidateSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ id: this._id, role: 'candidate' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Compare entered password with stored password
candidateSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;

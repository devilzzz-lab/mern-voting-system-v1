import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  aadhaar: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to generate auth token
AdminSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ id: this._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Compare entered password with stored password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;

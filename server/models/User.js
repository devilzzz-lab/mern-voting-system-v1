import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
  aadharNumber: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'candidate'],
    default: 'user',
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ userId: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};


// Compare entered password with stored password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model('User', userSchema);

export default User;

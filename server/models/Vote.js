// models/Vote.js
import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Vote = mongoose.model('Vote', VoteSchema);
export { Vote };

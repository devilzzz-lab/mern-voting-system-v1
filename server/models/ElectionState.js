import mongoose from 'mongoose';

const electionStateSchema = new mongoose.Schema(
  {
    started: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  {
    // Prevent more than one record of ElectionState in the collection
    // Ensures that only one election state document exists
    collection: 'electionState',
  }
);

// Ensure only one document exists by setting a static method
electionStateSchema.statics.getElectionState = async function () {
  const electionState = await this.findOne();
  if (!electionState) {
    return this.create({}); // Create a new election state if it doesn't exist
  }
  return electionState;
};

// Hook to enforce only one election state in the DB
electionStateSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingState = await this.constructor.countDocuments();
    if (existingState > 0) {
      const error = new Error('Only one election state can exist at a time');
      next(error);
    }
  }
  next();
});

// Create the model
const ElectionState = mongoose.model('ElectionState', electionStateSchema);

export default ElectionState;

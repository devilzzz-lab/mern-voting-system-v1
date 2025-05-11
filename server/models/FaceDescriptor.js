import mongoose from 'mongoose';

const faceDescriptorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    descriptor: {
      type: [Number], // array of numbers (Float32Array)
      required: true,
      validate: {
        validator: function(value) {
          // Ensure the descriptor has the correct length and value range
          return value.length === 128 && value.every(val => val >= -1 && val <= 1);
        },
        message: 'Invalid descriptor array: Must be 128 values between -1 and 1.'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } // Enable `createdAt` and `updatedAt`
);

// Create index for faster querying by userId
faceDescriptorSchema.index({ userId: 1 });

export default mongoose.model('FaceDescriptor', faceDescriptorSchema);

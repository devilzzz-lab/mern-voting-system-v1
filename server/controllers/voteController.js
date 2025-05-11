import ElectionState from '../models/ElectionState.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import { Vote } from '../models/Vote.js';
import mongoose from 'mongoose';


export const voteUser = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    const { candidateId } = req.body;

    // Check if the election is active
    const election = await ElectionState.findOne();
    if (!election || !election.started || election.ended) {
      return res.status(400).json({ message: "Election is not active." });
    }

    // Find the user who is voting
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if the user has already voted
    const alreadyVoted = await Vote.findOne({ userId: new mongoose.Types.ObjectId(user._id) });
    if (alreadyVoted) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Find the candidate being voted for
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(400).json({ message: "Invalid candidate." });
    }

    // Update vote count for the candidate
    candidate.voteCount = (candidate.voteCount || 0) + 1;
    await candidate.save();

    // Mark the user as having voted
    user.hasVoted = true;
    await user.save();

    // Create a record of the vote
    try {
      await Vote.create({ candidateId, userId: user._id });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "You have already voted." });
      }
      throw err;
    }
    return res.status(200).json({ message: "Vote successfully cast!" });
  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({ message: "Server error during vote" });
  }
};

export const submitVote = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { candidateId, descriptor } = req.body;

    if (!userId || !candidateId || !descriptor) {
      return res.status(400).json({ message: 'Missing userId, candidateId or descriptor' });
    }

    const election = await ElectionState.findOne({});
    if (!election || !election.active) {
      return res.status(403).json({ message: 'Election is not active.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingVote = await Vote.findOne({ userId });
    if (existingVote) return res.status(400).json({ message: 'You have already voted.' });

    const faceRecord = await FaceDescriptor.findOne({ userId });
    if (!faceRecord) return res.status(404).json({ message: 'No face descriptor found for verification.' });

    const match = compareFaceDescriptors(descriptor, faceRecord.descriptor);
    if (!match) return res.status(401).json({ message: 'Face verification failed. You cannot vote.' });

    const vote = new Vote({ userId, candidateId });
    await vote.save();

    res.status(200).json({ message: 'Vote submitted successfully.' });
  } catch (err) {
    console.error('Error submitting vote:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


export const getVoteStats = async (req, res) => {
  console.log('[getVoteStats] Starting vote statistics aggregation...');

  try {
    // Step 1: Aggregate vote counts per candidate
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "_id",
          as: "candidate"
        }
      },
      {
        $unwind: "$candidate"
      },
      {
        $project: {
          _id: 0,
          candidateId: "$candidate._id",
          name: "$candidate.name",
          party: "$candidate.party",
          votes: "$count"
        }
      }
    ]);

    console.log('[getVoteStats] Aggregated voteCounts:', voteCounts);

    // Step 2: Get all user votes with user and candidate details
    const userVotes = await Vote.find()
      .populate('userId', 'name email')
      .populate('candidateId', 'name party');

    console.log('[getVoteStats] Populated userVotes:', userVotes.length);

    // Step 3: Count total candidates
    const totalCandidates = await Candidate.countDocuments();
    console.log('[getVoteStats] Total candidates:', totalCandidates);

    // Step 4: Return all data
    res.json({
      voteCounts,
      userVotes,
      totalCandidates,
      totalUsersVoted: userVotes.length,
    });

    console.log('[getVoteStats] Response sent successfully.');
  } catch (err) {
    console.error('[getVoteStats] Error occurred:', err);
    res.status(500).json({ message: "Failed to fetch vote statistics." });
  }
};

export const checkIfVoted = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Correct key from decoded token
    console.log("Checking vote status for userId:", userId);

    const vote = await Vote.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (vote) {
      return res.json({ hasVoted: true });
    } else {
      return res.json({ hasVoted: false });
    }
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

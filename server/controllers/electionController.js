import ElectionState from '../models/ElectionState.js';

// Start election (token protected)
export const startElection = async (req, res) => {
  console.log('🔁 startElection triggered');
  try {
    // Fetch the current election state
    let electionState = await ElectionState.findOne();
    console.log('📥 Found election state:', electionState);

    if (!electionState) {
      electionState = new ElectionState(); // No election state exists, create a new one
      console.log('⚠️ No existing election state. Creating new.');
    }

    if (electionState.started) {
      console.log('❌ Election already started');
      return res.status(400).json({ message: 'Election has already started' });
    }

    // Set election state to started
    electionState.started = true;
    electionState.ended = false;
    electionState.startedAt = new Date();
    electionState.endedAt = null;

    // Save the election state
    await electionState.save();
    console.log('✅ Election started and saved');
    return res.json({ message: 'Election started successfully' });
  } catch (error) {
    console.error('💥 Error in startElection:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Stop election (token protected)
export const stopElection = async (req, res) => {
  console.log('🔁 stopElection triggered');
  try {
    // Fetch the current election state
    const electionState = await ElectionState.findOne();
    console.log('📥 Found election state:', electionState);

    if (!electionState || !electionState.started) {
      console.log('❌ Election not started yet');
      return res.status(400).json({ message: 'Election has not started yet' });
    }

    // Set election state to stopped
    electionState.started = false;
    electionState.ended = true;
    electionState.endedAt = new Date();

    // Save the election state
    await electionState.save();
    console.log('✅ Election stopped and saved');
    return res.json({ message: 'Election stopped successfully' });
  } catch (error) {
    console.error('💥 Error in stopElection:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get election state (token protected)
export const getElectionState = async (req, res) => {
  try {
    // Fetch the current election state
    let electionState = await ElectionState.findOne();
    if (!electionState) {
      // Create and save a new election state if none exists
      electionState = new ElectionState();
      await electionState.save();
    }

    // Send back the current state of the election
    return res.status(200).json({
      started: electionState.started || false,
      ended: electionState.ended || false,
      startedAt: electionState.startedAt || null,
      endedAt: electionState.endedAt || null,
    });
  } catch (error) {
    console.error('💥 Error in getElectionState:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get public election state (public access)
export const getPublicElectionState = async (req, res) => {
  try {
    // Fetch the current election state
    const state = await ElectionState.findOne({});
    if (!state) {
      return res.status(404).json({ message: 'Election state not found' });
    }

    // Send back the election state
    res.json(state);
  } catch (err) {
    console.error('💥 Error retrieving election state:', err);
    res.status(500).json({ message: 'Error retrieving election state' });
  }
};

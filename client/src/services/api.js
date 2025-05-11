import axios from 'axios';

const apiUrl = 'http://localhost:5001/api';  // Change this in production

//USER PROFILE
export const getUserProfile = async (userId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token provided');

  try {
    const response = await axios.get(`${apiUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Error fetching user profile: ${errorMessage}`);
  }
};

// Save face descriptor (no token needed)
export const saveFaceDescriptor = async ({ descriptor, userId }) => {
  if (!userId || !descriptor) {
    throw new Error('Missing userId or descriptor');
  }

  try {
    const res = await axios.post(`${apiUrl}/face/save`, { descriptor, userId }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    throw new Error(`Failed to save face descriptor: ${errorMessage}`);
  }
};

export const verifyFaceDescriptor = async (userId, descriptor) => {
  
  if (!(descriptor instanceof Array) || descriptor.some(d => typeof d !== 'number')) {
    throw new Error('Descriptor must be a valid array of numbers.');
  }

  try {
    const res = await axios.post(
      `${apiUrl}/face/verify`,
      {
        userId,
        descriptors: descriptor, // correct key
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error('Face verification failed:', errorMessage);
    throw new Error(`Face verification failed: ${errorMessage}`);
  }
};


// ✅ PUBLIC: Get the current election state (for users/candidates)
export const getPublicElectionState = async () => {
  try {
    const res = await axios.get(`${apiUrl}/election/public-state`);
    return res.data; // Response from backend should be the election state
  } catch (err) {
    console.error('Error fetching public election state:', err);
    throw new Error('Failed to fetch public election state');
  }
};


// Get the current election state (Admin protected)
export const getElectionState = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token provided');

  try {
    const res = await axios.get(`${apiUrl}/election/state`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching election state:', err);
    throw new Error('Failed to fetch election state');
  }
};

// Start the election (Admin protected)
export const startElection = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token provided');

  try {
    const res = await axios.post(`${apiUrl}/election/start`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error starting election:', err);
    throw new Error('Failed to start election');
  }
};

// End the election (Admin protected)
export const endElection = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token provided');

  try {
    const res = await axios.post(`${apiUrl}/election/end`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error('Error ending election:', err);
    throw new Error('Failed to end election');
  }
};


// Add a new candidate
export const addCandidate = async (candidateData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token provided');

  try {
    const res = await axios.post(`${apiUrl}/candidate/add-candidate`, candidateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // returns { message: 'Candidate added successfully' }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Failed to add candidate';
    console.error('Error adding candidate:', errorMessage);
    throw new Error(errorMessage);
  }
};


// Get the list of candidates
export const getCandidates = async () => {
  try {
    const res = await axios.get(`${apiUrl}/candidate`);
    return res.data;
  } catch (err) {
    console.error('Error fetching candidates:', err);
    throw new Error('Failed to fetch candidates');
  }
};

// Candidate login
export const loginCandidate = async (identifier, password) => {
  try {
    const res = await axios.post(`${apiUrl}/candidate/login`, { identifier, password });
    return res.data;
  } catch (err) {
    console.error('Candidate login failed:', err);
    throw new Error('Login failed: ' + (err.response?.data?.message || err.message));
  }
};

// Submit a vote for a candidate
export const submitVote = async (candidateId) => {
  const token = localStorage.getItem('token'); // Or from context/state if you're using that

  if (!token) {
    throw new Error('No auth token found');
  }

  try {
    const res = await axios.post(
      `${apiUrl}/vote`,
      { candidateId },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Add token to headers
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Vote submission error:', err);
    throw err;
  }
};

// Get vote statistics (Admin protected)
export const getVoteStats = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error("[getVoteStats] No token found in localStorage");
    throw new Error('No token provided');
  }

  try {
    const res = await axios.get(`${apiUrl}/vote/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;

  } catch (err) {
    console.error('[getVoteStats] Error:', err);
    throw new Error('Failed to fetch vote statistics');
  }
};




export default apiUrl;















import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import FaceVerify from '../components/FaceVerify';
import { getUserProfile, getPublicElectionState } from '../services/api';
import apiUrl from '../services/api';

const UserDashboard = () => {
  const [faceVerified, setFaceVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Verifying face...');
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [electionActive, setElectionActive] = useState(false);
  const [electionState, setElectionState] = useState(null);

  // Decode token and set userId on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    } catch (err) {
      console.error('❌ Invalid token');
    }
  }, []);

  // When face is verified, fetch all relevant dashboard data
  useEffect(() => {
    if (!faceVerified || !userId) return;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, candidatesRes, voteRes, electionRes] = await Promise.all([
          getUserProfile(userId),
          axios.get(`${apiUrl}/candidate`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/election/public-state`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getPublicElectionState(), // Public route for election state
        ]);

        setUserProfile(userRes);
        setCandidates(candidatesRes.data);
        setHasVoted(voteRes.data.hasVoted);

        // ✅ Interpret election state properly
        const state = electionRes;  // The result should already be in the correct format
        console.log('Election State:', state);

        // Check if the election is active
        const isActive = state.started && !state.ended;
        setElectionState(state);
        setElectionActive(isActive);

        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [faceVerified, userId]);

  const handleVote = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${apiUrl}/vote`,
        { candidateId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      setHasVoted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Vote failed.');
    }
  };

  const handleFaceVerified = (verified) => {
    setFaceVerified(verified);
    setStatusMessage(verified ? 'Face verified successfully!' : 'Face verification failed.');
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">User Dashboard</h2>

      {!faceVerified ? (
        <div className="text-center mt-4">
          <h5>{statusMessage}</h5>
          {userId && <FaceVerify userId={userId} onVerified={handleFaceVerified} />}
        </div>
      ) : loading ? (
        <div className="text-center mt-4">
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {userProfile && (
            <div className="alert alert-secondary text-center">
              Welcome, <strong>{userProfile.name}</strong> ({userProfile.email})
            </div>
          )}

          <div className={`alert text-center ${electionActive ? 'alert-info' : 'alert-warning'}`}>
            {electionActive
              ? hasVoted
                ? 'You have already voted.'
                : 'Election is active. Please cast your vote.'
              : 'Election is not currently active.'}
          </div>

          {/* Display detailed election state if available */}
          {electionState && (
            <div className="alert alert-info text-center mt-4">
              <h5>Election State:</h5>
              <p><strong>Started:</strong> {electionState.started ? 'Yes' : 'No'}</p>
              <p><strong>Ended:</strong> {electionState.ended ? 'Yes' : 'No'}</p>
              <p><strong>Started At:</strong> {new Date(electionState.startedAt).toLocaleString()}</p>
              <p><strong>Ended At:</strong> {electionState.endedAt ? new Date(electionState.endedAt).toLocaleString() : 'Not ended yet'}</p>
            </div>
          )}

          {electionActive && !hasVoted && (
            <div className="row">
              {candidates.map((candidate) => (
                <div className="col-md-4 mb-3" key={candidate._id}>
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
                      <h5 className="card-title">{candidate.name}</h5>
                      <p className="card-text">{candidate.party}</p>
                      <button
                        className="btn btn-success"
                        onClick={() => handleVote(candidate._id)}
                      >
                        Vote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;

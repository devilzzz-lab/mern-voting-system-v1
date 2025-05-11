import { useState, useEffect } from 'react';
import {
  Button, Card, Row, Col, Container, Spinner, Modal, Form, Table
} from 'react-bootstrap';
import {
  startElection, endElection, getElectionState, addCandidate, getVoteStats
} from '../services/api';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import {
  Chart, BarElement, CategoryScale, LinearScale
} from 'chart.js';
import Papa from 'papaparse';
import 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
import '../AdminDashboard.css'

Chart.register(BarElement, CategoryScale, LinearScale);

function AdminDashboard() {
  const [electionState, setElectionState] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    name: '', party: '', email: '', password: '', aadhaar: '', phone: ''
  });
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [voteStats, setVoteStats] = useState(null);
  const [formValidated, setFormValidated] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getElectionState().then(setElectionState);
    getVoteStats().then(setVoteStats);
  }, []);

  useEffect(() => {
    if (electionState.started && electionState.startedAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(electionState.startedAt);
        const diff = now - start;
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeElapsed(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [electionState]);

  const handleConfirmModal = (type) => {
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  const handleElectionControl = async () => {
    setLoading(true);
    try {
      const res = actionType === 'start' ? await startElection() : await endElection();
      toast.success(res.message);
      const newState = await getElectionState();
      setElectionState(newState);
      const stats = await getVoteStats();
      setVoteStats(stats);
    } catch {
      toast.error('Failed to update election');
    }
    setLoading(false);
    handleCloseConfirmModal();
  };

  const handleCandidateChange = (e) => {
    const { name, value } = e.target;
    setCandidateForm({ ...candidateForm, [name]: value });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setFormValidated(true);

    if (!e.currentTarget.checkValidity()) return;

    setCandidateLoading(true);
    try {
      const res = await addCandidate(candidateForm);
      setMessage(res.message);
      setCandidateForm({ name: '', party: '', email: '', password: '', aadhaar: '', phone: '' });
      const stats = await getVoteStats();
      setVoteStats(stats);
    } catch {
      setMessage('Failed to add candidate');
    }
    setCandidateLoading(false);
  };

  const getUserEmailsByCandidateId = (candidateId) => {
    const users = voteStats?.userVotes
      ?.filter(v => v.candidateId?._id === candidateId)
      ?.map(v => v.userId?.email);
    return users?.join(', ') || 'N/A';
  };

  const getWinner = () => {
    if (!voteStats?.voteCounts?.length) return null;
    return voteStats.voteCounts.reduce((max, c) => c.votes > max.votes ? c : max, voteStats.voteCounts[0]);
  };

  const handleExportCSV = () => {
    const winner = getWinner();
    const csvData = [
      { Info: 'Total Users Voted', Value: voteStats.userVotes?.length || 0 },
      { Info: 'Winner', Value: `${winner?.name} (${winner?.party})` },
      {},
      { Name: 'Candidate Name', Party: 'Party', 'Voter Emails': 'Voter Emails', Votes: 'Votes' },
      ...voteStats.voteCounts.map(({ name, party, candidateId, votes }) => ({
        Name: name,
        Party: party,
        'Voter Emails': getUserEmailsByCandidateId(candidateId),
        Votes: votes
      }))
    ];
    const csv = Papa.unparse(csvData, { quotes: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'votes.csv');
    link.click();
  };

  const handleExportPDF = () => {
  const winner = getWinner();
  const winnerName = winner?.name || "No Winner";
  const winnerParty = winner?.party || "Unknown";

  const pdfContent = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; padding: 20px; background-color: #f4f4f9;">
      <h2 style="text-align: center; color: #0056b3; font-size: 24px;">Election Results</h2>
      <p style="text-align: center; font-size: 18px;"><strong>Total Users Voted:</strong> ${voteStats.userVotes?.length || 0}</p>
      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 22px; font-weight: bold; color: green;">🎉 Winner: <span style="font-size: 28px; color: #2e8b57;">${winnerName}</span> (${winnerParty})</p>
      </div>

      <h3 style="color: #0056b3;">Vote Breakdown</h3>
      <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f1f1f1; color: #333;">Candidate Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f1f1f1; color: #333;">Party</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f1f1f1; color: #333;">Voter Emails</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f1f1f1; color: #333;">Votes</th>
          </tr>
        </thead>
        <tbody>
          ${voteStats.voteCounts.map(({ name, party, candidateId, votes }) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${party}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${getUserEmailsByCandidateId(candidateId)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${votes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: center;">
        <p style="font-size: 12px; color: #555;">Generated by your Voting System</p>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = pdfContent;

  html2pdf().from(element).save('votes.pdf');
};


  const isElectionRunning = electionState.started && !electionState.ended;
  const isElectionEnded = electionState.ended;
  const winner = isElectionEnded ? getWinner() : null;

  const chartData = voteStats?.voteCounts?.length
    ? {
        labels: voteStats.voteCounts.map(c => c.name),
        datasets: [{
          label: 'Votes',
          data: voteStats.voteCounts.map(c => c.votes),
          backgroundColor: voteStats.voteCounts.map(c =>
            winner && c.candidateId === winner.candidateId
              ? 'rgba(0, 200, 83, 0.8)'
              : 'rgba(54, 162, 235, 0.6)'
          ),
          borderColor: voteStats.voteCounts.map(c =>
            winner && c.candidateId === winner.candidateId
              ? 'rgba(0, 150, 0, 1)'
              : 'rgba(54, 162, 235, 1)'
          ),
          borderWidth: 1,
        }],
      }
    : null;

  return (
    <div className="admin-dashboard">
      <div className="video-container">
        <video autoPlay loop muted playsInline className="background-video">
        <source src="/videos/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div class="overlay"></div>

      </div>

      <Container className="position-relative">
        <h1 className="text-center my-4 glow-text">Admin Dashboard</h1>

        <Row className="mb-4">
          <Col md={6}>
            <Card body>
              <h5>Election Status</h5>
              <p>Status: {isElectionRunning ? 'Running' : isElectionEnded ? 'Ended' : 'Not Started'}</p>
              {isElectionRunning && timeElapsed && <p>Time Elapsed: {timeElapsed}</p>}
              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => handleConfirmModal('start')} disabled={isElectionRunning || loading}>Start Election</Button>
                <Button variant="danger" onClick={() => handleConfirmModal('end')} disabled={!isElectionRunning || loading}>End Election</Button>
              </div>
            </Card>
          </Col>

          <Col md={6}>
            <Card body>
              <h5>Add Candidate</h5>
              <Form noValidate validated={formValidated} onSubmit={handleAddCandidate}>
                <Row>
                  <Col><Form.Control required name="name" placeholder="Name" value={candidateForm.name} onChange={handleCandidateChange} /></Col>
                  <Col><Form.Control required name="party" placeholder="Party" value={candidateForm.party} onChange={handleCandidateChange} /></Col>
                </Row>
                <Row className="mt-2">
                  <Col><Form.Control required name="email" type="email" placeholder="Email" value={candidateForm.email} onChange={handleCandidateChange} /></Col>
                  <Col><Form.Control required name="password" type="password" placeholder="Password" value={candidateForm.password} onChange={handleCandidateChange} /></Col>
                </Row>
                <Row className="mt-2">
                  <Col><Form.Control required name="aadhaar" placeholder="Aadhaar" value={candidateForm.aadhaar} onChange={handleCandidateChange} /></Col>
                  <Col><Form.Control required name="phone" placeholder="Phone" value={candidateForm.phone} onChange={handleCandidateChange} /></Col>
                </Row>
                <div className="mt-3">
                  <Button type="submit" disabled={candidateLoading}>
                    {candidateLoading ? <Spinner size="sm" /> : 'Add Candidate'}
                  </Button>
                </div>
              </Form>
              {message && <p className="mt-2">{message}</p>}
            </Card>
          </Col>
        </Row>

        {chartData && (
          <Card body className="mb-4">
            <h5 className="mb-3">Vote Statistics</h5>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </Card>
        )}

        {voteStats?.voteCounts?.length > 0 && (
          <Card body className="mb-4">
            <h5 className="mb-3">Vote Breakdown</h5>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Party</th>
                  <th>Votes</th>
                  <th>Voter Emails</th>
                </tr>
              </thead>
              <tbody>
                {voteStats.voteCounts.map(({ name, party, candidateId, votes }) => (
                  <tr key={candidateId}>
                    <td>{name}</td>
                    <td>{party}</td>
                    <td>{votes}</td>
                    <td>{getUserEmailsByCandidateId(candidateId)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {isElectionEnded && (
          <div className="text-center mb-4">
            <Button variant="info" className="me-3" onClick={handleExportCSV}>Export CSV</Button>
            <Button variant="secondary" onClick={handleExportPDF}>Export PDF</Button>
          </div>
        )}
          </Card>
        )}
      </Container>

      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm {actionType === 'start' ? 'Start' : 'End'} Election</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to {actionType} the election?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>Cancel</Button>
          <Button variant={actionType === 'start' ? 'success' : 'danger'} onClick={handleElectionControl}>
            {loading ? <Spinner size="sm" /> : actionType === 'start' ? 'Start' : 'End'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminDashboard;

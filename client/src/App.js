import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin'; // Admin login component
import CandidateLogin from './pages/CandidateLogin'; // Candidate login component
import UserLogin from './pages/UserLogin'; // User login component
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import UserDashboard from './pages/UserDashboard';
import Register from './pages/Register'; // Ensure this is correctly imported
import FaceTest from './components/FaceTest';
import 'bootstrap/dist/css/bootstrap.min.css';
import FaceVerify from './components/FaceVerify'; // Updated for face verification
import FaceRegister from './components/FaceRegister'; // Updated for face registration

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        {/* Separate login routes for each role */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/candidate" element={<CandidateLogin />} />
        <Route path="/login/user" element={<UserLogin />} />
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        
        {/* Register route, if needed */}
        <Route path="/register/:role" element={<Register />} /> 

        <Route path="/facetest" element={<FaceTest />} />
        <Route path="/faceregister" element={<FaceRegister />} />  {/* Updated for face registration */}
        <Route path="/faceverify" element={<FaceVerify />} />  {/* Updated for face verification */}
        
      </Routes>
    </Router>
  );
}

export default App;

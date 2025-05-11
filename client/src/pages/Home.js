// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaUserShield, FaUserTie, FaUserAlt } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="home-container">
      <Row className="align-items-center justify-content-center min-vh-100 text-center">
        <Col md={8}>
          <motion.h1 
            className="home-title mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to the Voting System
          </motion.h1>

          <motion.h3
            className="home-subtitle mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Login or Register as:
          </motion.h3>

          <Row className="justify-content-center">
            {/* Admin */}
            <Col xs={12} md={4} className="mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="primary" size="lg" className="w-100" onClick={() => navigate('/login/admin')}>
                  <FaUserShield className="me-2" /> Admin Login
                </Button>
              </motion.div>
            </Col>

            {/* Candidate */}
            <Col xs={12} md={4} className="mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="success" size="lg" className="w-100" onClick={() => navigate('/login/candidate')}>
                  <FaUserTie className="me-2" /> Candidate Login
                </Button>
              </motion.div>
            </Col>

            {/* Voter */}
            <Col xs={12} md={4} className="mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ButtonGroup vertical className="w-100">
                  <Button variant="info" size="lg" className="mb-2" onClick={() => navigate('/login/user')}>
                    <FaUserAlt className="me-2" /> Voter Login
                  </Button>
                  <Button variant="outline-info" size="lg" onClick={() => navigate('/register/user')}>
                    <FaUserAlt className="me-2" /> Voter Register
                  </Button>
                </ButtonGroup>
              </motion.div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

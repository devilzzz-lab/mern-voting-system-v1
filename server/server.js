import express from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import electionRoutes from './routes/electionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js'; 
import voteRoutes from './routes/voteRoutes.js';
import faceRoutes from './routes/face.js';


const { json } = bodyParser;

config(); // Load environment variables from .env file
const app = express();

// CORS configuration to allow frontend access
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Body parsing for JSON requests
app.use(json());

// MongoDB connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/votingSystem')
  .then(() => console.log('Connected to MongoDB 😒'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

// API routes setup
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/vote', voteRoutes); // this is important
app.use('/api/face', faceRoutes);



// Start server on specified port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

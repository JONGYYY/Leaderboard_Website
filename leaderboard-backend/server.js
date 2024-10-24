const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  'https://leaderboard-website-one.vercel.app', // Development URL
  process.env.FRONTEND_URL, // Production URL (set this in your environment variables)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        // Allow requests with no origin (e.g., mobile apps or curl requests)
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

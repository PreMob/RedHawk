const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Suppress util._extend deprecation warning
process.noDeprecation = true;

// Database connection
mongoose.connect('mongodb://localhost:27017/redhawk')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const logRoutes = require('./routes/logRoutes');
const chatRoutes = require('./routes/chatRoutes');

// API routes
app.use('/api', logRoutes);
app.use('/api/chat', chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Model imports
require('./models/LogAnalysis');
require('./models/ChatConversation');
require('./models/ScanResult');

// Route imports
const logRoutes = require('./routes/logRoutes');
const chatRoutes = require('./routes/chatRoutes');
const scanRoutes = require('./routes/scanRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/redhawk';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB Connected: ${MONGO_URI.split('@')[1] || 'localhost'}`))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api', logRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/scan', scanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
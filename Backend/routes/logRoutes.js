const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const logAnalyzerController = require('../controllers/logAnalyzerController');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    console.log('Uploads directory:', uploadsDir);
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory:', uploadsDir);
    }
    
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const filename = `temp_${Date.now()}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Error handling middleware for multer
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: `Server error during upload: ${err.message}` });
    }
    next();
  });
};

// Analyze log file
router.post('/analyze-log', handleUpload, logAnalyzerController.analyzeLog);

// Get list of log analyses
router.get('/analyses', logAnalyzerController.getLogAnalyses);

// Get specific log analysis by ID
router.get('/analyses/:id', logAnalyzerController.getLogAnalysisById);

module.exports = router; 
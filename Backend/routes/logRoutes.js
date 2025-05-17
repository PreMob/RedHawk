const express = require('express');
const multer = require('multer');
const router = express.Router();
const logAnalyzerController = require('../controllers/logAnalyzerController');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `temp_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Analyze log file
router.post('/analyze-log', upload.single('file'), logAnalyzerController.analyzeLog);

// Get list of log analyses
router.get('/analyses', logAnalyzerController.getLogAnalyses);

// Get specific log analysis by ID
router.get('/analyses/:id', logAnalyzerController.getLogAnalysisById);

module.exports = router; 
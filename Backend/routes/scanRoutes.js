const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');

// Scan a URL and save results to database
router.post('/scan-url', scannerController.scanUrl);

// Get all scan results
router.get('/results', scannerController.getScanResults);

// Get a specific scan result by ID
router.get('/results/:id', scannerController.getScanResultById);

module.exports = router;

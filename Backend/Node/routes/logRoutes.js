const express = require('express');
const multer = require('multer');
const router = express.Router();
const logAnalyzerController = require('../controllers/logAnalyzerController');

const upload = multer({ dest: 'uploads/' });

router.post('/analyze-log', upload.single('file'), logAnalyzerController.analyzeLog);

module.exports = router;

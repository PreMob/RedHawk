const anomalyDetector = require('../services/anomalyDetector');
const fs = require('fs');
const axios = require('axios');

exports.analyzeLog = async (req, res) => {
  try {
    let logData = '';

    if (req.file) {
      logData = fs.readFileSync(req.file.path, 'utf-8');
    } else if (req.body.url) {
      const response = await axios.get(req.body.url);
      logData = response.data;
    } else {
      return res.status(400).json({ error: 'No file uploaded or URL provided' });
    }

    const analysisResult = await anomalyDetector.detectAnomalies(logData);
    res.json({ analysis: analysisResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

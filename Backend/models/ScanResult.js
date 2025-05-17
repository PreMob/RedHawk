const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
  targetUrl: {
    type: String,
    required: true
  },
  scanDate: {
    type: Date,
    default: Date.now
  },
  vulnerabilities: [
    {
      type: {
        type: String,
        required: true
      },
      severity: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW']
      },
      description: String,
      affectedComponent: String,
      remediation: String
    }
  ],
  summary: {
    totalVulnerabilities: Number,
    highSeverity: Number,
    mediumSeverity: Number,
    lowSeverity: Number
  },
  scanDetails: {
    duration: Number,
    portsScanned: [Number],
    openPorts: [
      {
        port: Number,
        service: String
      }
    ],
    technologies: [String]
  }
});

module.exports = mongoose.model('ScanResult', ScanResultSchema); 
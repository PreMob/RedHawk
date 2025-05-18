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
  rawResults: {
    headers: {
      type: Map,
      of: String
    },
    technologies: [String],
    outdated: [String],
    vulnTests: {
      sqlInjection: [
        {
          test: String,
          length: Number
        }
      ],
      sqlInjectionSuspected: Boolean,
      xss: [
        {
          payload: String,
          reflected: Boolean
        }
      ],
      xssSuspected: Boolean
    },
    errors: [String]
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
    type: String,
    required: true
  },
  scanDetails: {
    duration: Number,
    technologies: [String]
  }
});

module.exports = mongoose.model('ScanResult', ScanResultSchema); 
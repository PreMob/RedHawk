const mongoose = require('mongoose');

const LogEntrySchema = new mongoose.Schema({
  timestamp: {
    type: String
  },
  sourceIp: {
    type: String
  },
  type: {
    type: String,
    enum: ['normal', 'probe', 'attack', 'anomaly', 'threat']
  },
  sensitivity: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW']
  },
  status: {
    type: String,
    enum: ['ALERT', 'INFO']
  },
  recommendedAction: {
    type: String
  }
});

const LogAnalysisSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  totalRecords: {
    type: Number
  },
  predictionCounts: {
    type: Map,
    of: Number
  },
  predictionPercentages: {
    type: Map,
    of: Number
  },
  textSummary: {
    type: String
  },
  recommendedActions: [String],
  logEntries: [LogEntrySchema],
  visualizationData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  rawSummaryData: {
    type: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model('LogAnalysis', LogAnalysisSchema); 
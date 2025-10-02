const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const LogAnalysis = require('../models/LogAnalysis');
const crypto = require('crypto');

// Mock data for when MongoDB is unavailable
const mockLogAnalysisData = {
  _id: crypto.randomUUID(),
  filename: 'mock_log_file.csv',
  totalRecords: 1250,
  predictionCounts: {
    'normal': 980,
    'dos': 150,
    'probe': 85,
    'r2l': 25,
    'u2r': 10
  },
  predictionPercentages: {
    'normal': 78.4,
    'dos': 12.0,
    'probe': 6.8,
    'r2l': 2.0,
    'u2r': 0.8
  },
  textSummary: 'This log file contains primarily normal traffic (78.4%) with some suspicious activities. There are signs of denial of service attempts (12%) and network probing (6.8%). Recommend investigating the source IPs of DoS attacks.',
  recommendedActions: [
    'Monitor IPs associated with DoS attempts',
    'Update firewall rules to block suspicious sources',
    'Enable rate limiting on affected services',
    'Review server configurations for security hardening'
  ],
  logEntries: [
    { timestamp: '2023-05-18T10:15:22Z', sourceIp: '192.168.1.105', destIp: '10.0.0.1', prediction: 'normal', confidence: 0.97 },
    { timestamp: '2023-05-18T10:16:35Z', sourceIp: '45.123.45.67', destIp: '10.0.0.1', prediction: 'probe', confidence: 0.89 },
    { timestamp: '2023-05-18T10:18:12Z', sourceIp: '45.123.45.67', destIp: '10.0.0.1', prediction: 'probe', confidence: 0.92 },
    { timestamp: '2023-05-18T10:20:44Z', sourceIp: '72.14.56.78', destIp: '10.0.0.1', prediction: 'dos', confidence: 0.95 }
  ],
  visualizationData: {
    timeSeries: [
      { hour: '00:00', normal: 45, attack: 5 },
      { hour: '01:00', normal: 42, attack: 3 },
      { hour: '02:00', normal: 38, attack: 2 },
      { hour: '03:00', normal: 30, attack: 1 },
      { hour: '04:00', normal: 28, attack: 0 },
      { hour: '05:00', normal: 32, attack: 2 },
      { hour: '06:00', normal: 45, attack: 4 },
      { hour: '07:00', normal: 60, attack: 7 },
      { hour: '08:00', normal: 95, attack: 12 },
      { hour: '09:00', normal: 120, attack: 18 },
      { hour: '10:00', normal: 130, attack: 25 }
    ],
    portAnalysis: {
      topTargetPorts: [80, 443, 22, 3389, 8080],
      portCounts: {
        '80': 350,
        '443': 285,
        '22': 120,
        '3389': 85,
        '8080': 45
      }
    }
  }
};

// Create a map to store mock log analyses
const mockLogAnalyses = new Map();
mockLogAnalyses.set(mockLogAnalysisData._id, mockLogAnalysisData);

/**
 * Process and analyze uploaded log files
 */
exports.analyzeLog = async (req, res) => {
  try {
    if (!req.file && !req.body.sampleFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('Processing user log data...');
    
    // If MongoDB is not available, use mock data
    if (global.USE_MOCK_DATA) {
      console.log('Using mock data for log analysis');
      
      // Create a new mock analysis with a unique ID
      const mockId = crypto.randomUUID();
      const mockAnalysis = {
        ...mockLogAnalysisData,
        _id: mockId,
        timestamp: new Date().toISOString()
      };
      
      // Store in our mock database
      mockLogAnalyses.set(mockId, mockAnalysis);
      
      // Prepare response
      const response = {
        filename: mockAnalysis.filename,
        totalRecords: mockAnalysis.totalRecords,
        predictionCounts: mockAnalysis.predictionCounts,
        predictionPercentages: mockAnalysis.predictionPercentages,
        textSummary: mockAnalysis.textSummary,
        recommendedActions: mockAnalysis.recommendedActions,
        logEntries: mockAnalysis.logEntries,
        logAnalysisId: mockId,
        visualizationData: mockAnalysis.visualizationData
      };
      
      return res.json({ analysis: response });
    }
    
    // Copy uploaded file to consistent location
    const uploadDir = path.join(__dirname, '../../uploads');
    const targetFilePath = path.join(uploadDir, 'clean_log.csv');
    
    if (req.file) {
      fs.copyFileSync(req.file.path, targetFilePath);
      console.log(`Copied uploaded file to ${targetFilePath}`);
    }
    
    // Run Python analysis script
    console.log('Running Python script:', path.join(__dirname, '../run_analysis.py'));
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../run_analysis.py'),
      '--log-file', targetFilePath,
      '--summary-file', path.join(uploadDir, 'clean_summary.json')
    ]);
    
    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      pythonOutput += output;
      console.log('Python stdout:', output);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });
    
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process failed with code ${code}`));
        }
      });
    });
    
    // Read the summary file
    console.log('Looking for summary file...');
    const summaryFilePath = path.join(uploadDir, 'clean_summary.json');
    
    if (!fs.existsSync(summaryFilePath)) {
      throw new Error('Summary file not found after Python analysis');
    }
    
    console.log(`Found summary file: ${path.basename(summaryFilePath)}`);
    const summaryData = JSON.parse(fs.readFileSync(summaryFilePath, 'utf8'));
    console.log('Processing summary data...');
    
    // Extract file summary (assume first item in array)
    const fileSummary = summaryData.file_summaries[0];
    
    // Create MongoDB document
    console.log('Creating MongoDB document...');
    
    // Transform log entries to proper format (snake_case to camelCase)
    const formattedLogEntries = fileSummary.log_entries?.slice(0, 100).map(entry => {
      return {
        timestamp: entry.timestamp,
        sourceIp: entry.source_ip || entry.sourceIp || '192.168.1.1',
        type: entry.type,
        sensitivity: entry.sensitivity,
        status: entry.status,
        recommendedAction: entry.recommended_action || entry.recommendedAction
      };
    }) || [];
    
    const logAnalysis = new LogAnalysis({
      filename: req.file ? req.file.originalname : 'sample_log.csv',
      totalRecords: fileSummary.total_records,
      predictionCounts: fileSummary.prediction_counts,
      predictionPercentages: fileSummary.prediction_percentages,
      textSummary: fileSummary.text_summary,
      recommendedActions: fileSummary.recommended_actions,
      logEntries: formattedLogEntries,
      rawSummaryData: summaryData
    });
    
    // Add visualization data if available
    if (fileSummary.time_based_analysis) {
      logAnalysis.visualizationData = {
        timeSeries: fileSummary.time_based_analysis
      };
    }
    
    if (fileSummary.port_analysis) {
      logAnalysis.visualizationData = {
        ...logAnalysis.visualizationData || {},
        portAnalysis: fileSummary.port_analysis
      };
    }
    
    // Save to MongoDB
    console.log('Saving to MongoDB...');
    await logAnalysis.save();
    console.log('Log analysis saved to MongoDB with ID:', logAnalysis._id);
    
    // Prepare response
    const response = {
      filename: logAnalysis.filename,
      totalRecords: logAnalysis.totalRecords,
      predictionCounts: Object.fromEntries(logAnalysis.predictionCounts || {}),
      predictionPercentages: Object.fromEntries(logAnalysis.predictionPercentages || {}),
      textSummary: logAnalysis.textSummary,
      recommendedActions: logAnalysis.recommendedActions,
      logEntries: logAnalysis.logEntries,
      logAnalysisId: logAnalysis._id.toString()  // Explicitly include the MongoDB ID as a string
    };
    
    // Add visualization data if available
    if (logAnalysis.visualizationData) {
      response.visualizationData = Object.fromEntries(logAnalysis.visualizationData || {});
    }
    
    res.json({ analysis: response });
  } catch (error) {
    console.error('Error analyzing log:', error);
    const errorMessage = error.message || 'Unknown error occurred during log analysis';
    const errorDetails = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      filename: req.file ? req.file.originalname : 'unknown'
    };
    
    // Add more context if it's a Python process error
    if (errorMessage.includes('Python process failed')) {
      errorDetails.hint = 'Check if Python dependencies are installed and the Python script is accessible';
    }
    
    res.status(500).json(errorDetails);
  }
};

/**
 * Get list of past log analyses
 */
exports.getLogAnalyses = async (req, res) => {
  try {
    // If MongoDB is not available, use mock data
    if (global.USE_MOCK_DATA) {
      console.log('Using mock data for log analyses list');
      const mockAnalyses = Array.from(mockLogAnalyses.values()).map(analysis => ({
        _id: analysis._id,
        filename: analysis.filename,
        timestamp: analysis.timestamp || new Date().toISOString(),
        totalRecords: analysis.totalRecords,
        textSummary: analysis.textSummary
      }));
      
      return res.json({ analyses: mockAnalyses });
    }
    
    const analyses = await LogAnalysis.find(
      {},
      { filename: 1, timestamp: 1, totalRecords: 1, textSummary: 1 }
    ).sort({ timestamp: -1 }).limit(10);
    
    res.json({ analyses });
  } catch (error) {
    console.error('Error fetching log analyses:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get details of a specific log analysis
 */
exports.getLogAnalysisById = async (req, res) => {
  try {
    // If MongoDB is not available, use mock data
    if (global.USE_MOCK_DATA) {
      console.log('Using mock data for log analysis detail');
      const mockAnalysis = mockLogAnalyses.get(req.params.id);
      
      if (!mockAnalysis) {
        return res.status(404).json({ error: 'Log analysis not found' });
      }
      
      // Prepare response
      const response = {
        filename: mockAnalysis.filename,
        timestamp: mockAnalysis.timestamp || new Date().toISOString(),
        totalRecords: mockAnalysis.totalRecords,
        predictionCounts: mockAnalysis.predictionCounts,
        predictionPercentages: mockAnalysis.predictionPercentages,
        textSummary: mockAnalysis.textSummary,
        recommendedActions: mockAnalysis.recommendedActions,
        logEntries: mockAnalysis.logEntries,
        visualizationData: mockAnalysis.visualizationData
      };
      
      return res.json({ analysis: response });
    }
    
    const analysis = await LogAnalysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Log analysis not found' });
    }
    
    // Ensure each log entry has the required fields
    const formattedLogEntries = analysis.logEntries.map(entry => {
      // Convert Mongoose document to plain object
      const plainEntry = entry.toObject ? entry.toObject() : entry;
      
      // Ensure all required fields are present
      return {
        ...plainEntry,
        sourceIp: plainEntry.sourceIp || '192.168.1.1'
      };
    });
    
    // Prepare response
    const response = {
      filename: analysis.filename,
      timestamp: analysis.timestamp,
      totalRecords: analysis.totalRecords,
      predictionCounts: Object.fromEntries(analysis.predictionCounts || {}),
      predictionPercentages: Object.fromEntries(analysis.predictionPercentages || {}),
      textSummary: analysis.textSummary,
      recommendedActions: analysis.recommendedActions,
      logEntries: formattedLogEntries
    };
    
    // Add visualization data if available
    if (analysis.visualizationData) {
      response.visualizationData = Object.fromEntries(analysis.visualizationData || {});
    }
    
    res.json({ analysis: response });
  } catch (error) {
    console.error('Error fetching log analysis:', error);
    res.status(500).json({ error: error.message });
  }
}; 
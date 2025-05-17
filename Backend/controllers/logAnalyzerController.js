const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const LogAnalysis = require('../models/LogAnalysis');

/**
 * Process and analyze uploaded log files
 */
exports.analyzeLog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('Processing user log data...');
    
    // Copy uploaded file to consistent location
    const uploadDir = path.join(__dirname, '../uploads');
    const targetFilePath = path.join(uploadDir, 'clean_log.csv');
    
    fs.copyFileSync(req.file.path, targetFilePath);
    console.log(`Copied uploaded file to ${targetFilePath}`);
    
    // Run Python analysis script
    console.log('Running Python script:', path.join(__dirname, '../run_analysis.py'));
    const pythonProcess = spawn('python3', [
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
    const logAnalysis = new LogAnalysis({
      filename: req.file.originalname,
      totalRecords: fileSummary.total_records,
      predictionCounts: fileSummary.prediction_counts,
      predictionPercentages: fileSummary.prediction_percentages,
      textSummary: fileSummary.text_summary,
      recommendedActions: fileSummary.recommended_actions,
      logEntries: fileSummary.log_entries?.slice(0, 100) || [], // Limit to first 100 entries
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
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get list of past log analyses
 */
exports.getLogAnalyses = async (req, res) => {
  try {
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
    const analysis = await LogAnalysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Log analysis not found' });
    }
    
    // Prepare response
    const response = {
      filename: analysis.filename,
      timestamp: analysis.timestamp,
      totalRecords: analysis.totalRecords,
      predictionCounts: Object.fromEntries(analysis.predictionCounts || {}),
      predictionPercentages: Object.fromEntries(analysis.predictionPercentages || {}),
      textSummary: analysis.textSummary,
      recommendedActions: analysis.recommendedActions,
      logEntries: analysis.logEntries
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
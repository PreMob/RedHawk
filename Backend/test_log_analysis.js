const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const mongoose = require('mongoose');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redhawk';

// Path to the log file
const logFilePath = 'C:\\Users\\pbpan\\OneDrive\\Desktop\\Aventus\\RedHawk\\uploads\\clean_log.csv';

// Connect to MongoDB
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log(`MongoDB Connected: ${MONGO_URI.split('@').pop() || 'localhost'}`);
  
  // Test log analysis functionality
  console.log(`Testing log analysis with file: ${logFilePath}`);
  
  // Check if the file exists
  if (!fs.existsSync(logFilePath)) {
    console.error(`Log file not found at: ${logFilePath}`);
    await mongoose.connection.close();
    return;
  }
  
  // Path to the Python script
  const pythonScriptPath = path.join(__dirname, 'AI', 'test_log_summary.py');
  
  // Execute the Python script
  const command = `python "${pythonScriptPath}" --input "${logFilePath}" --output "log_analysis_result.json"`;
  console.log(`Running command: ${command}`);
  
  exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing log analysis script: ${error.message}`);
      console.error(`Standard error: ${stderr}`);
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Log analysis output: ${stdout}`);
    
    // Try to read the output file
    try {
      if (fs.existsSync('log_analysis_result.json')) {
        const result = JSON.parse(fs.readFileSync('log_analysis_result.json', 'utf8'));
        console.log('Log analysis result:', JSON.stringify(result, null, 2));
      } else {
        console.log('No output file was generated. Check the script output for details.');
      }
    } catch (err) {
      console.error(`Error reading output file: ${err.message}`);
    }
    
    // Close the MongoDB connection
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  });
}).catch(err => {
  console.error('MongoDB Connection Error:', err.message);
}); 
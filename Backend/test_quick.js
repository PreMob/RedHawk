const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3001/api';
const LOG_FILE = path.join(__dirname, 'uploads', 'clean_log.csv');

async function quickTest() {
  console.log('Uploading log file for analysis...');
  
  try {
    // Upload log file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(LOG_FILE));
    
    const response = await axios.post(`${API_URL}/analyze-log`, formData, { 
      headers: formData.getHeaders()
    });
    
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.analysis) {
      const logAnalysisId = response.data.analysis._id || response.data.analysis.logAnalysisId;
      
      if (logAnalysisId) {
        console.log(`\nTesting chatbot with logAnalysisId: ${logAnalysisId}`);
        
        // Send a test message
        const chatResponse = await axios.post(`${API_URL}/chat/message`, {
          message: 'Summarize the security issues in the log file',
          logAnalysisId
        });
        
        console.log('\nChatbot response:', chatResponse.data);
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

quickTest(); 
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3001/api';
const LOG_FILE = path.join(__dirname, 'uploads', 'clean_log.csv');

async function testLogAnalysis() {
  console.log('Testing log analysis endpoint...');
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(LOG_FILE));
    
    const headers = {
      ...formData.getHeaders()
    };
    
    const response = await axios.post(`${API_URL}/analyze-log`, formData, { headers });
    
    console.log('Log analysis successful:');
    console.log('Analysis ID:', response.data.analysis.logAnalysisId);
    console.log('Text summary:', response.data.analysis.textSummary);
    console.log('Recommended actions:', response.data.analysis.recommendedActions);
    
    return response.data.analysis.logAnalysisId;
  } catch (error) {
    console.error('Error in log analysis:', error.response?.data || error.message);
    return null;
  }
}

async function testChatbot(logAnalysisId) {
  console.log('\nTesting chatbot endpoints...');
  
  try {
    // First message
    const message1 = 'What security issues did you find in the logs?';
    console.log(`Sending message: "${message1}"`);
    
    const chatResponse1 = await axios.post(`${API_URL}/chat/message`, {
      message: message1,
      logAnalysisId
    });
    
    const sessionId = chatResponse1.data.sessionId;
    console.log('Assistant response:', chatResponse1.data.response);
    console.log('Session ID:', sessionId);
    
    // Second message in same session
    const message2 = 'What actions should I take?';
    console.log(`\nSending message: "${message2}"`);
    
    const chatResponse2 = await axios.post(`${API_URL}/chat/message`, {
      message: message2,
      sessionId
    });
    
    console.log('Assistant response:', chatResponse2.data.response);
    
    // Get conversation history
    console.log('\nFetching conversation history...');
    const historyResponse = await axios.get(`${API_URL}/chat/history/${sessionId}`);
    console.log('Conversation history has', historyResponse.data.history.length, 'messages');
    
    return true;
  } catch (error) {
    console.error('Error in chatbot test:', error.response?.data || error.message);
    return false;
  }
}

async function testAvailableLogs() {
  console.log('\nTesting available logs endpoint...');
  
  try {
    const response = await axios.get(`${API_URL}/chat/available-logs`);
    console.log('Available logs:', response.data.logs.length);
    return true;
  } catch (error) {
    console.error('Error fetching available logs:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  try {
    // First test log analysis
    const logAnalysisId = await testLogAnalysis();
    
    if (logAnalysisId) {
      // Then test chatbot with the log analysis
      await testChatbot(logAnalysisId);
      
      // Test available logs endpoint
      await testAvailableLogs();
    }
    
    console.log('\nTesting complete!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests(); 
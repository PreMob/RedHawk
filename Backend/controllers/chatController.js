const chatbotService = require('../services/chatbotService');
const LogAnalysis = require('../models/LogAnalysis');
const { v4: uuidv4 } = require('uuid');

/**
 * Send a message to the RedHawk Assistant and get a response
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, logAnalysisId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use provided sessionId or generate a new one
    const chatSessionId = sessionId || uuidv4();
    
    // Get assistant response
    const response = await chatbotService.getResponse(message, chatSessionId, logAnalysisId);
    
    res.json({
      response: response.response,
      sessionId: chatSessionId
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get conversation history
 */
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const history = await chatbotService.getConversationHistory(sessionId);
    res.json({ history });
  } catch (error) {
    console.error('Error in getHistory controller:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get available log analyses for chat
 */
exports.getAvailableLogs = async (req, res) => {
  try {
    // Get recent log analyses with text summaries
    const logs = await LogAnalysis.find(
      { textSummary: { $exists: true, $ne: null } },
      { filename: 1, timestamp: 1, textSummary: 1, totalRecords: 1 }
    ).sort({ timestamp: -1 }).limit(10);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error in getAvailableLogs controller:', error);
    res.status(500).json({ error: error.message });
  }
}; 
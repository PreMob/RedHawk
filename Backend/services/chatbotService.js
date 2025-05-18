const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ChatConversation = require('../models/ChatConversation');
const LogAnalysis = require('../models/LogAnalysis');
const markdownStructure = require('../utils/markdownStructure');

// Store mock conversations when MongoDB is unavailable
const mockConversations = new Map();

// Mock responses for common security questions
const mockResponses = {
  general: [
    "Based on the log analysis, I recommend implementing additional firewall rules to block the suspicious IP addresses detected in the logs.",
    "The scan shows signs of reconnaissance activity. I suggest reviewing your network security policies and implementing rate limiting on public-facing services.",
    "Your logs indicate normal traffic patterns with some isolated anomalies. Continue monitoring but no immediate action required based on current data.",
    "I've analyzed the security logs and found potential brute force attempts targeting your authentication systems. Consider implementing account lockout policies."
  ],
  specific: {
    "dos": "The logs show potential Denial of Service (DoS) attack patterns. I recommend implementing rate limiting and reviewing your DDoS protection strategy.",
    "sql": "There are indicators of SQL injection attempts in your logs. Review your web application security and ensure proper input validation is in place.",
    "xss": "Cross-site scripting (XSS) attempts were detected. Implement Content-Security-Policy headers and ensure proper output encoding in your web applications.",
    "firewall": "Based on the analysis, your firewall configuration appears to be working as expected, but there are some recommended rule updates to improve security posture."
  }
};

// Helper function to get a mock response based on user query
function getMockResponse(query, logAnalysisId) {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific keywords and provide targeted responses
  if (lowerQuery.includes('dos') || lowerQuery.includes('denial of service')) {
    return mockResponses.specific.dos;
  } else if (lowerQuery.includes('sql') || lowerQuery.includes('injection')) {
    return mockResponses.specific.sql;
  } else if (lowerQuery.includes('xss') || lowerQuery.includes('cross site')) {
    return mockResponses.specific.xss;
  } else if (lowerQuery.includes('firewall')) {
    return mockResponses.specific.firewall;
  }
  
  // If no specific match, return a general response
  const randomIndex = Math.floor(Math.random() * mockResponses.general.length);
  return mockResponses.general[randomIndex];
}

/**
 * Service to handle communication with the RedHawk Assistant (redhawk_assistant.py)
 */
class ChatbotService {
  /**
   * Get response from the RedHawk Assistant
   * @param {string} query - User's query text
   * @param {string} sessionId - Unique session identifier
   * @param {string} logAnalysisId - Optional ID of related log analysis
   * @returns {Promise<Object>} Response from assistant
   */
  async getResponse(query, sessionId, logAnalysisId = null) {
    try {
      // Use mock data if MongoDB is unavailable
      if (global.USE_MOCK_DATA) {
        console.log('Using mock data for chat response');
        
        // Generate mock response
        const assistantResponse = getMockResponse(query, logAnalysisId);
        
        // Store in mock conversation history
        if (!mockConversations.has(sessionId)) {
          mockConversations.set(sessionId, {
            sessionId,
            relatedLogAnalysisId: logAnalysisId,
            messages: [],
            lastActivity: new Date()
          });
        }
        
        const mockConversation = mockConversations.get(sessionId);
        
        // Add user message and assistant response
        mockConversation.messages.push({ role: 'user', content: query });
        mockConversation.messages.push({ role: 'assistant', content: assistantResponse });
        mockConversation.lastActivity = new Date();
        
        return {
          response: assistantResponse,
          sessionId
        };
      }
      
      // Get log analysis data if ID provided
      let summaryData = null;
      let tempSummaryPath = null;
      
      if (logAnalysisId) {
        const logAnalysis = await LogAnalysis.findById(logAnalysisId);
        if (logAnalysis) {
          // Debug log
          console.log('LogAnalysis data:', {
            id: logAnalysis._id,
            recommendedActions: logAnalysis.recommendedActions
          });
          
          summaryData = {
            file_summaries: [{
              total_records: logAnalysis.totalRecords,
              prediction_counts: Object.fromEntries(logAnalysis.predictionCounts || {}),
              prediction_percentages: Object.fromEntries(logAnalysis.predictionPercentages || {}),
              text_summary: logAnalysis.textSummary,
              recommended_actions: logAnalysis.recommendedActions || [],
              summary_stats: {
                high_sensitivity_count: logAnalysis.logEntries?.filter(e => e.sensitivity === 'HIGH').length || 0,
                medium_sensitivity_count: logAnalysis.logEntries?.filter(e => e.sensitivity === 'MEDIUM').length || 0,
                low_sensitivity_count: logAnalysis.logEntries?.filter(e => e.sensitivity === 'LOW').length || 0,
                alert_count: logAnalysis.logEntries?.filter(e => e.status === 'ALERT').length || 0,
                info_count: logAnalysis.logEntries?.filter(e => e.status === 'INFO').length || 0
              }
            }],
            meta: {
              total_files_analyzed: 1,
              total_records_analyzed: logAnalysis.totalRecords,
              high_sensitivity_total: logAnalysis.logEntries?.filter(e => e.sensitivity === 'HIGH').length || 0,
              alert_status_total: logAnalysis.logEntries?.filter(e => e.status === 'ALERT').length || 0
            },
            timestamp: logAnalysis.timestamp
          };
          
          // Write summary to temporary file for assistant
          const tempDir = path.join(__dirname, '../uploads');
          tempSummaryPath = path.join(tempDir, `temp_summary_${Date.now()}.json`);
          fs.writeFileSync(tempSummaryPath, JSON.stringify(summaryData, null, 2));
          
          // Debug log the summary data
          console.log('Summary data for assistant:', JSON.stringify(summaryData.file_summaries[0].recommended_actions));
        }
      }
      
      // Prepare command-line arguments
      const pythonScriptPath = path.join(__dirname, '../AI/redhawk_assistant.py');
      const args = [
        pythonScriptPath,
        '--api-key', process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY || 'dummy-key',
        '--query', query
      ];
      
      // Add summary file path if available
      if (tempSummaryPath) {
        args.push('--summary', tempSummaryPath);
      }
      
      return new Promise((resolve, reject) => {
        // Spawn Python process
        const pythonProcess = spawn('python', args);
        
        let responseData = '';
        let errorData = '';
        
        pythonProcess.stdout.on('data', (data) => {
          responseData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });
        
        pythonProcess.on('close', async (code) => {
          // Clean up temporary file
          if (tempSummaryPath && fs.existsSync(tempSummaryPath)) {
            fs.unlinkSync(tempSummaryPath);
          }
          
          if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            console.error(`Error output: ${errorData}`);
            return reject(new Error(`Assistant error: ${errorData || 'Unknown error'}`));
          }
          
          // Extract assistant response (strip "RedHawk Assistant: " prefix if present)
          let assistantResponse = responseData.trim();
          const prefixMatch = assistantResponse.match(/RedHawk Assistant:\s*(.*)/);
          if (prefixMatch) {
            assistantResponse = prefixMatch[1].trim();
          }
          
          // Debug log
          console.log('Assistant response:', assistantResponse);
          
          // Save conversation in database
          try {
            // Find existing conversation or create new one
            let conversation = await ChatConversation.findOne({ sessionId });
            
            if (!conversation) {
              conversation = new ChatConversation({
                sessionId,
                relatedLogAnalysisId: logAnalysisId,
                messages: []
              });
            }
            
            // Add user message
            conversation.messages.push({
              role: 'user',
              content: query
            });
            
            // Add assistant response
            conversation.messages.push({
              role: 'assistant',
              content: assistantResponse
            });
            
            // Update last activity timestamp
            conversation.lastActivity = new Date();
            
            // Save conversation
            await conversation.save();
          } catch (dbError) {
            console.error('Error saving conversation to database:', dbError);
            // Continue anyway since we have the response
          }
          
          // Format response with markdown if requested
          let formattedResponse = assistantResponse;
          
          // If the query contains 'markdown' or 'format', enhance the response with markdown
          if (query.toLowerCase().includes('markdown') || query.toLowerCase().includes('format')) {
            try {
              // Get log analysis data if available
              let metadata = {};
              
              if (logAnalysis) {
                metadata = {
                  logAnalysis,
                  securityLevel: logAnalysis.highSensitivityCount > 0 ? 'HIGH' : 
                                 logAnalysis.mediumSensitivityCount > 0 ? 'MEDIUM' : 'LOW',
                  timestamp: logAnalysis.timestamp
                };
              }
              
              // Format the response as markdown
              formattedResponse = markdownStructure.formatRedHawkResponse(assistantResponse, metadata);
              console.log('Response formatted as markdown');
            } catch (mdError) {
              console.error('Error formatting response as markdown:', mdError);
              // Continue with unformatted response
            }
          }
          
          resolve({ 
            response: formattedResponse,
            sessionId,
            format: query.toLowerCase().includes('markdown') ? 'markdown' : 'text'
          });
        });
      });
    } catch (error) {
      console.error('Error in chatbot service:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation history
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<Array>} Array of messages
   */
  async getConversationHistory(sessionId) {
    try {
      // Use mock data if MongoDB is unavailable
      if (global.USE_MOCK_DATA) {
        console.log('Using mock data for conversation history');
        return mockConversations.get(sessionId)?.messages || [];
      }
      
      const conversation = await ChatConversation.findOne({ sessionId });
      return conversation?.messages || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }
}

module.exports = new ChatbotService(); 
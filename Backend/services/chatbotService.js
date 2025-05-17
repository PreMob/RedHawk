const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ChatConversation = require('../models/ChatConversation');
const LogAnalysis = require('../models/LogAnalysis');

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
          const tempDir = path.join(__dirname, '../../uploads');
          tempSummaryPath = path.join(tempDir, `temp_summary_${Date.now()}.json`);
          fs.writeFileSync(tempSummaryPath, JSON.stringify(summaryData, null, 2));
          
          // Debug log the summary data
          console.log('Summary data for assistant:', JSON.stringify(summaryData.file_summaries[0].recommended_actions));
        }
      }
      
      // Prepare command-line arguments
      const pythonScriptPath = path.join(__dirname, '../../AI/redhawk_assistant.py');
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
        const pythonProcess = spawn('python3', args);
        
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
          
          resolve({ 
            response: assistantResponse,
            sessionId
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
      const conversation = await ChatConversation.findOne({ sessionId });
      return conversation?.messages || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }
}

module.exports = new ChatbotService(); 
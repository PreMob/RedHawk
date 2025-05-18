const mongoose = require('mongoose');
require('./models/ChatConversation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/redhawk';

async function fetchChatReplies() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get ChatConversation model
    const ChatConversation = mongoose.model('ChatConversation');
    
    // Find all conversations
    const conversations = await ChatConversation.find({}).sort({ lastActivity: -1 }).limit(5);
    
    console.log(`Found ${conversations.length} conversations\n`);
    
    // Display each conversation
    conversations.forEach((convo, index) => {
      console.log(`\n----- Conversation ${index + 1} -----`);
      console.log(`Session ID: ${convo.sessionId}`);
      console.log(`Started: ${convo.startedAt}`);
      console.log(`Last activity: ${convo.lastActivity}`);
      console.log(`Related log analysis: ${convo.relatedLogAnalysisId || 'None'}\n`);
      
      // Display messages
      console.log('Messages:');
      convo.messages.forEach((msg, msgIndex) => {
        console.log(`\n[${msgIndex + 1}] ${msg.role.toUpperCase()} (${new Date(msg.timestamp).toLocaleString()})`);
        console.log(`${msg.content}`);
      });
      
      console.log('\n' + '-'.repeat(40));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fetchChatReplies(); 
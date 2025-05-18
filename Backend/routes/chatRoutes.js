const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send a message to the chat assistant and get a response
router.post('/message', chatController.sendMessage);

// Get conversation history
router.get('/history/:sessionId', chatController.getHistory);

// Get available log analyses for chat
router.get('/analyses', chatController.getAvailableLogs);

module.exports = router; 
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send message to chatbot
router.post('/message', chatController.sendMessage);

// Get conversation history
router.get('/history/:sessionId', chatController.getHistory);

// Get available log analyses for chat
router.get('/available-logs', chatController.getAvailableLogs);

module.exports = router; 
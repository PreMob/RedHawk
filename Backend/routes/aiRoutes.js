const express = require('express');
const router = express.Router();
const aiBriefingController = require('../controllers/aiBriefingController');

router.get('/briefing', aiBriefingController.getBriefing);

module.exports = router;

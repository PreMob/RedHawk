const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');

router.post('/scan-url', scannerController.scanUrl);

module.exports = router;

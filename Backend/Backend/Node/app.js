const express = require('express');
const app = express();
const logRoutes = require('./routes/logRoutes');
const scanRoutes = require('./routes/scanRoutes');

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', logRoutes);
app.use('/api', scanRoutes);

module.exports = app;

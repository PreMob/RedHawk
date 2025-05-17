const request = require('supertest');
const express = require('express');
const multer = require('multer');
const logRoutes = require('../routes/logRoutes');
const anomalyDetector = require('../services/anomalyDetector');
const app = express();

app.use(express.json());
app.use('/api', logRoutes);

// Mock the anomalyDetector service
jest.mock('../services/anomalyDetector', () => ({
  detectAnomalies: jest.fn(() => Promise.resolve({ issues: ['dummy issue'] })),
}));

describe('Log Analyzer Controller', () => {
  it('should respond to POST /api/analyze-log', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .attach('file', Buffer.from('test log content'), 'test.log');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('analysis');
    expect(res.body.analysis).toEqual({ issues: ['dummy issue'] });
  });
});

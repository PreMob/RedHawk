const request = require('supertest');
const express = require('express');
const logRoutes = require('../routes/logRoutes');

const app = express();

app.use(express.json());
app.use('/api', logRoutes);

describe('Log Analyzer Controller', () => {
  beforeEach(() => {
    global.USE_MOCK_DATA = true;
  });

  afterEach(() => {
    delete global.USE_MOCK_DATA;
  });

  it('responds to POST /api/analyze-log with analysis data', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .attach('file', Buffer.from('timestamp,source_ip,type\n2024-01-01,10.0.0.1,normal'), 'test.csv');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('analysis');
    expect(res.body.analysis).toHaveProperty('predictionCounts');
    expect(res.body.analysis).toHaveProperty('logAnalysisId');
  });
});

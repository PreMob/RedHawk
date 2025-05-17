const request = require('supertest');
const express = require('express');
const scanRoutes = require('../routes/scanRoutes');
const app = express();

app.use(express.json());
app.use('/api', scanRoutes);

describe('Scanner Controller', () => {
  it('should respond to POST /api/scan-url', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'https://example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('URL scanning endpoint');
  });
});

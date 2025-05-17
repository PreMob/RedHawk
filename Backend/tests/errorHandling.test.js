describe('Error Handling and Edge Cases', () => {
  test('POST /api/analyze-log without file should return error', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .expect(400);
  });

  test('POST /api/scan-url with invalid URL should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'invalid-url' })
      .expect(400);
  });

  test('POST /api/scan-url without target_url should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({})
      .expect(400);
  });
});describe('Error Handling and Edge Cases', () => {
  test('POST /api/analyze-log without file should return error', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/scan-url with invalid URL should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'invalid-url' })
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/scan-url without target_url should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({})
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });
});const request = require('supertest');
const express = require('express');
const logRoutes = require('../routes/logRoutes');
const scanRoutes = require('../routes/scanRoutes');
const app = express();

app.use(express.json());
app.use('/api', logRoutes);
app.use('/api', scanRoutes);

describe('Error Handling and Edge Cases', () => {
  test('POST /api/analyze-log without file should return error', async () => {
    const res = await request(app)
      .post('/api/analyze-log');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/scan-url with invalid URL should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'invalid-url' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/scan-url without target_url should return error', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

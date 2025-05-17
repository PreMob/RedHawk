const request = require('supertest');
const app = require('../app');

describe('Integration Tests for API Endpoints', () => {
  it('POST /api/analyze-log should accept file upload and respond', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .attach('file', Buffer.from('test log content'), 'test.log');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Log analysis endpoint');
  });

  it('POST /api/scan-url should accept JSON body and respond', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'https://example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('URL scanning endpoint');
  });
});

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const childProcess = require('child_process');
const scanRoutes = require('../routes/scanRoutes');

const app = express();

app.use(express.json());
app.use('/api', scanRoutes);

describe('Scanner Controller', () => {
  beforeEach(() => {
    global.USE_MOCK_DATA = true;
    childProcess.exec.mockImplementation((command, options, callback) => {
      callback(null, JSON.stringify({
        url: 'https://example.com',
        summary: 'No obvious security issues detected.',
        raw_results: {
          headers: { server: 'example' },
          technologies: ['example'],
          outdated: [],
          vuln_tests: {},
          errors: []
        }
      }), '');
    });
  });

  afterEach(() => {
    delete global.USE_MOCK_DATA;
    jest.clearAllMocks();
  });

  it('responds to POST /api/scan-url with scan data', async () => {
    const res = await request(app)
      .post('/api/scan-url')
      .send({ target_url: 'https://example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('target_url', 'https://example.com');
    expect(res.body).toHaveProperty('raw_results');
  });
});

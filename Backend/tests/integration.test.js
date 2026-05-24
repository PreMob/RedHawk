jest.mock('child_process', () => ({
  exec: jest.fn(),
  spawn: jest.fn()
}));

const request = require('supertest');
const childProcess = require('child_process');
const app = require('../app');

describe('Integration Tests for API Endpoints', () => {
  beforeEach(() => {
    global.USE_MOCK_DATA = true;
    childProcess.exec.mockImplementation((command, options, callback) => {
      callback(null, JSON.stringify({
        url: 'https://example.com',
        summary: 'No obvious security issues detected.',
        raw_results: {
          headers: {},
          technologies: [],
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

  it('POST /api/analyze-log accepts file upload and returns analysis JSON', async () => {
    const res = await request(app)
      .post('/api/analyze-log')
      .attach('file', Buffer.from('timestamp,source_ip,type\n2024-01-01,10.0.0.1,normal'), 'test.csv');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('analysis');
    expect(res.body.analysis).toHaveProperty('logAnalysisId');
  });

  it('POST /api/scan/scan-url accepts JSON body and returns scan JSON', async () => {
    const res = await request(app)
      .post('/api/scan/scan-url')
      .send({ target_url: 'https://example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('target_url', 'https://example.com');
    expect(res.body).toHaveProperty('raw_results');
  });

  it('GET /api/ai/briefing returns a generated briefing', async () => {
    const res = await request(app).get('/api/ai/briefing');

    expect(res.statusCode).toBe(200);
    expect(res.body.briefing).toHaveProperty('riskScore');
    expect(res.body.briefing.attackPath).toHaveLength(5);
  });
});

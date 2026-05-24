const request = require('supertest');
const app = require('../app');
const authService = require('../services/authService');

describe('Authentication Routes', () => {
  beforeEach(() => {
    global.USE_MOCK_DATA = true;
    authService._resetAuthStore();
  });

  afterEach(() => {
    delete global.USE_MOCK_DATA;
    authService._resetAuthStore();
  });

  it('registers a new analyst account and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Analyst',
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      name: 'Security Analyst',
      email: 'analyst@example.com',
      role: 'analyst'
    });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate registration attempts', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Analyst',
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Analyst',
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('logs in and validates the current user token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Analyst',
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe('analyst@example.com');
  });

  it('blocks protected APIs without a token', async () => {
    const res = await request(app).get('/api/analyses');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('blocks protected APIs with a tampered token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Analyst',
        email: 'analyst@example.com',
        password: 'Redhawk123!'
      });

    const tamperedToken = `${registerRes.body.token.slice(0, -1)}x`;
    const res = await request(app)
      .get('/api/analyses')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

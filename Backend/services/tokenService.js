const crypto = require('crypto');

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

const getSecret = () => process.env.AUTH_TOKEN_SECRET || 'redhawk-development-token-secret';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const decode = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

const sign = (data) =>
  crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url');

const getTtlSeconds = () => {
  const configuredTtl = Number(process.env.AUTH_TOKEN_TTL_SECONDS);
  return Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_TTL_SECONDS;
};

const createAuthError = (message) => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const assertSafeSignature = (actual, expected) => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw createAuthError('Invalid authentication token');
  }
};

const signToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + getTtlSeconds()
  };

  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw createAuthError('Authentication token is required');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw createAuthError('Invalid authentication token');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
  assertSafeSignature(signature, expectedSignature);

  let payload;
  try {
    payload = decode(encodedPayload);
  } catch (error) {
    throw createAuthError('Invalid authentication token');
  }

  if (!payload.sub || !payload.email || !payload.exp) {
    throw createAuthError('Invalid authentication token');
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw createAuthError('Authentication token expired');
  }

  return payload;
};

module.exports = {
  signToken,
  verifyToken
};

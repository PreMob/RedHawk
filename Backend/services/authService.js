const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { signToken } = require('./tokenService');

const memoryUsers = new Map();

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const validateEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError('A valid email address is required');
  }
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    throw createError('Password must be at least 8 characters long');
  }
};

const validateName = (name) => {
  const safeName = String(name || '').trim();
  if (safeName.length < 2) {
    throw createError('Name must be at least 2 characters long');
  }
  if (safeName.length > 80) {
    throw createError('Name must be 80 characters or fewer');
  }
  return safeName;
};

const shouldUseMongo = () => !global.USE_MOCK_DATA && mongoose.connection.readyState === 1;

const scrypt = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = async (password, storedHash) => {
  const [algorithm, salt, hash] = String(storedHash || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const actual = await scrypt(password, salt);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const toSafeUser = (user) => {
  if (!user) return null;
  if (typeof user.toSafeUser === 'function') return user.toSafeUser();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
};

const createSession = (user) => {
  const safeUser = toSafeUser(user);
  return {
    user: safeUser,
    token: signToken(safeUser)
  };
};

const findMemoryUserByEmail = (email) =>
  Array.from(memoryUsers.values()).find((user) => user.email === email) || null;

const registerUser = async ({ name, email, password }) => {
  const safeName = validateName(name);
  const safeEmail = normalizeEmail(email);
  validateEmail(safeEmail);
  validatePassword(password);

  const passwordHash = await hashPassword(password);
  const useMongo = shouldUseMongo();

  if (useMongo) {
    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      throw createError('An account with this email already exists', 409);
    }

    try {
      const user = await User.create({
        name: safeName,
        email: safeEmail,
        passwordHash,
        role: 'analyst'
      });
      return createSession(user);
    } catch (error) {
      if (error.code === 11000) {
        throw createError('An account with this email already exists', 409);
      }
      throw error;
    }
  }

  if (findMemoryUserByEmail(safeEmail)) {
    throw createError('An account with this email already exists', 409);
  }

  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    name: safeName,
    email: safeEmail,
    passwordHash,
    role: 'analyst',
    createdAt: now,
    lastLoginAt: null
  };
  memoryUsers.set(user.id, user);

  return createSession(user);
};

const loginUser = async ({ email, password }) => {
  const safeEmail = normalizeEmail(email);
  validateEmail(safeEmail);

  if (!password) {
    throw createError('Password is required');
  }

  const useMongo = shouldUseMongo();
  const user = useMongo
    ? await User.findOne({ email: safeEmail })
    : findMemoryUserByEmail(safeEmail);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw createError('Invalid email or password', 401);
  }

  const lastLoginAt = new Date();
  if (useMongo) {
    user.lastLoginAt = lastLoginAt;
    await user.save();
  } else {
    user.lastLoginAt = lastLoginAt.toISOString();
    memoryUsers.set(user.id, user);
  }

  return createSession(user);
};

const getUserById = async (userId) => {
  if (!userId) return null;

  if (shouldUseMongo()) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    const user = await User.findById(userId);
    return toSafeUser(user);
  }

  return toSafeUser(memoryUsers.get(userId));
};

const resetAuthStore = () => {
  memoryUsers.clear();
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  _resetAuthStore: resetAuthStore
};

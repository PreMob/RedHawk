const authService = require('../services/authService');

const sendError = (res, error) => {
  res.status(error.statusCode || 500).json({
    error: error.message || 'Authentication request failed'
  });
};

const register = async (req, res) => {
  try {
    const session = await authService.registerUser(req.body || {});
    res.status(201).json(session);
  } catch (error) {
    sendError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const session = await authService.loginUser(req.body || {});
    res.status(200).json(session);
  } catch (error) {
    sendError(res, error);
  }
};

const me = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  login,
  me
};

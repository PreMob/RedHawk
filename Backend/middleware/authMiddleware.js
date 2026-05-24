const { verifyToken } = require('../services/tokenService');
const authService = require('../services/authService');

const readBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = readBearerToken(req.headers.authorization);
    const payload = verifyToken(token);
    const user = await authService.getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }

    req.auth = payload;
    req.user = user;
    next();
  } catch (error) {
    res.status(error.statusCode || 401).json({
      error: error.message || 'Unauthorized'
    });
  }
};

module.exports = {
  requireAuth
};

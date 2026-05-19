const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '8h';

exports.generateToken = (payload) => {
  const normalizedPayload = {
    ...payload,
    role: payload.role ? payload.role.toLowerCase() : 'member',
  };
  return jwt.sign(normalizedPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

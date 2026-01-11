const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');

/**
 * Generate JWT Token
 * @param {String} id - User ID
 * @returns {String} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 * Generate JWT Token with custom payload
 * @param {Object} payload - Custom payload
 * @param {String} expiresIn - Token expiration (optional)
 * @returns {String} - JWT Token
 */
const generateCustomToken = (payload, expiresIn = JWT_EXPIRE) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT Token
 * @param {String} token - JWT Token
 * @returns {Object} - Decoded token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  generateCustomToken,
  verifyToken
};
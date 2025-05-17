const jwt = require('jsonwebtoken');
require('dotenv').config();

// Validate environment configuration
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Custom error handling
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw err;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = { 
  generateToken, 
  verifyToken, 
  decodeToken 
};
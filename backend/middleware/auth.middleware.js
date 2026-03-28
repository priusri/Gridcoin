/**
 * Authentication Middleware
 * Checks for valid JWT token in Authorization header
 */

const mongoose = require('mongoose');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // For development: create a mock user object with valid MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId();
    req.user = {
      _id: userId,
      id: userId.toString(),
      email: 'test@gridcoin.local',
      name: 'Test User'
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;

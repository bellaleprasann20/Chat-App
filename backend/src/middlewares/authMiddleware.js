const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  try {
    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from Bearer token
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token expired.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Optional auth - Attach user if token exists, but don't require it
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without user
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    next();

  } catch (error) {
    // If token is invalid, just continue without user
    console.error('Optional auth error:', error.message);
    next();
  }
};

// Check if user is admin (if you want to add admin functionality)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

// Check if user is room creator
const isRoomCreator = (Chat) => {
  return async (req, res, next) => {
    try {
      const chat = await Chat.findById(req.params.id);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (chat.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized. Only room creator can perform this action.'
        });
      }

      req.chat = chat;
      next();

    } catch (error) {
      console.error('Room creator check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Check if user is room member
const isRoomMember = (Chat) => {
  return async (req, res, next) => {
    try {
      const chat = await Chat.findById(req.params.roomId || req.params.id);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found'
        });
      }

      if (!chat.members.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized. You must be a member of this room.'
        });
      }

      req.chat = chat;
      next();

    } catch (error) {
      console.error('Room member check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

module.exports = {
  protect,
  optionalAuth,
  admin,
  isRoomCreator,
  isRoomMember
};
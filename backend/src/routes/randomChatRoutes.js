const express = require('express');
const router = express.Router();
const { getStats, getUserStatus } = require('../controllers/randomChatController');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/random/stats
// @desc    Get random chat queue stats
// @access  Private
router.get('/stats', protect, getStats);

// @route   GET /api/random/status
// @desc    Check if user is in active chat
// @access  Private
router.get('/status', protect, getUserStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getDirectMessages,
  getOrCreateDM,
  getDMMessages,
  sendDMMessage,
  getUsers
} = require('../controllers/directMessageController');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/dm/users
// @desc    Get all users (for starting new DM)
// @access  Private
router.get('/users', protect, getUsers);

// @route   GET /api/dm
// @desc    Get all direct message conversations
// @access  Private
router.get('/', protect, getDirectMessages);

// @route   POST /api/dm/:userId
// @desc    Get or create DM conversation with a user
// @access  Private
router.post('/:userId', protect, getOrCreateDM);

// @route   GET /api/dm/:dmId/messages
// @desc    Get messages in a DM conversation
// @access  Private
router.get('/:dmId/messages', protect, getDMMessages);

// @route   POST /api/dm/:dmId/messages
// @desc    Send message in DM
// @access  Private
router.post('/:dmId/messages', protect, sendDMMessage);

module.exports = router;
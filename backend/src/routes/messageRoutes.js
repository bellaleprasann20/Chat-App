const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  getMessage,
  searchMessages
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/messages/:roomId
// @desc    Get all messages for a chat room
// @access  Private
router.get('/:roomId', protect, getMessages);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/single/:id
// @desc    Get single message
// @access  Private
router.get('/single/:id', protect, getMessage);

// @route   PUT /api/messages/:id
// @desc    Update a message
// @access  Private
router.put('/:id', protect, updateMessage);

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', protect, deleteMessage);

// @route   GET /api/messages/:roomId/search
// @desc    Search messages in a room
// @access  Private
router.get('/:roomId/search', protect, searchMessages);

module.exports = router;
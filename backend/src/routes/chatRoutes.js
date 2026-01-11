const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom,
  getRoomMembers
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/chat/rooms
// @desc    Get all chat rooms
// @access  Private
router.get('/rooms', protect, getRooms);

// @route   POST /api/chat/rooms
// @desc    Create a new chat room
// @access  Private
router.post('/rooms', protect, createRoom);

// @route   GET /api/chat/rooms/:id
// @desc    Get single chat room
// @access  Private
router.get('/rooms/:id', protect, getRoom);

// @route   PUT /api/chat/rooms/:id
// @desc    Update chat room (creator only)
// @access  Private
router.put('/rooms/:id', protect, updateRoom);

// @route   DELETE /api/chat/rooms/:id
// @desc    Delete chat room (creator only)
// @access  Private
router.delete('/rooms/:id', protect, deleteRoom);

// @route   POST /api/chat/rooms/:id/join
// @desc    Join a chat room
// @access  Private
router.post('/rooms/:id/join', protect, joinRoom);

// @route   POST /api/chat/rooms/:id/leave
// @desc    Leave a chat room
// @access  Private
router.post('/rooms/:id/leave', protect, leaveRoom);

// @route   GET /api/chat/rooms/:id/members
// @desc    Get room members
// @access  Private
router.get('/rooms/:id/members', protect, getRoomMembers);

module.exports = router;
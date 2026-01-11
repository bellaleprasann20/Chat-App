const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get all chat rooms
// @route   GET /api/chat/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Chat.find()
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single chat room
// @route   GET /api/chat/rooms/:id
// @access  Private
const getRoom = async (req, res) => {
  try {
    const room = await Chat.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('members', 'username email');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new chat room
// @route   POST /api/chat/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room name'
      });
    }

    // Check if room name already exists
    const roomExists = await Chat.findOne({ name });

    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: 'Room with this name already exists'
      });
    }

    // Create room
    const room = await Chat.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id]
    });

    // Populate creator
    await room.populate('creator', 'username email');

    res.status(201).json({
      success: true,
      data: room
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Join chat room
// @route   POST /api/chat/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Chat.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this room'
      });
    }

    // Add user to members
    room.members.push(req.user._id);
    await room.save();

    await room.populate('creator', 'username email');
    await room.populate('members', 'username email');

    res.status(200).json({
      success: true,
      message: 'Successfully joined the room',
      data: room
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Leave chat room
// @route   POST /api/chat/rooms/:id/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await Chat.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a member
    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }

    // Remove user from members
    room.members = room.members.filter(
      member => member.toString() !== req.user._id.toString()
    );

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the room'
    });

  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update chat room
// @route   PUT /api/chat/rooms/:id
// @access  Private (Only creator)
const updateRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await Chat.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is the creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    // Update fields
    room.name = name || room.name;
    room.description = description !== undefined ? description : room.description;

    await room.save();

    await room.populate('creator', 'username email');
    await room.populate('members', 'username email');

    res.status(200).json({
      success: true,
      data: room
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete chat room
// @route   DELETE /api/chat/rooms/:id
// @access  Private (Only creator)
const deleteRoom = async (req, res) => {
  try {
    const room = await Chat.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is the creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    // Delete all messages in the room
    await Message.deleteMany({ chat: room._id });

    // Delete the room
    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get room members
// @route   GET /api/chat/rooms/:id/members
// @access  Private
const getRoomMembers = async (req, res) => {
  try {
    const room = await Chat.findById(req.params.id)
      .populate('members', 'username email createdAt');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    res.status(200).json({
      success: true,
      count: room.members.length,
      data: room.members
    });

  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom,
  getRoomMembers
};
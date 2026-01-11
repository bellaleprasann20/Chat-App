const DirectMessage = require('../models/DirectMessage');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all direct message conversations
// @route   GET /api/dm
// @access  Private
const getDirectMessages = async (req, res) => {
  try {
    const dms = await DirectMessage.find({
      participants: req.user._id
    })
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .sort({ updatedAt: -1 });

    // Format response with unread count and other user info
    const formattedDMs = dms.map(dm => {
      const otherUser = dm.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      
      return {
        _id: dm._id,
        otherUser,
        lastMessage: dm.lastMessage,
        unreadCount: dm.unreadCount.get(req.user._id.toString()) || 0,
        updatedAt: dm.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedDMs
    });

  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get or create DM conversation with a user
// @route   POST /api/dm/:userId
// @access  Private
const getOrCreateDM = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if trying to DM yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create DM with yourself'
      });
    }

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create DM
    const dm = await DirectMessage.findOrCreate(req.user._id, userId);

    res.status(200).json({
      success: true,
      data: dm
    });

  } catch (error) {
    console.error('Get or create DM error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages in a DM conversation
// @route   GET /api/dm/:dmId/messages
// @access  Private
const getDMMessages = async (req, res) => {
  try {
    const { dmId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Check if DM exists and user is participant
    const dm = await DirectMessage.findById(dmId);
    
    if (!dm) {
      return res.status(404).json({
        success: false,
        message: 'Direct message conversation not found'
      });
    }

    if (!dm.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get messages
    const messages = await Message.find({ chat: dmId })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    messages.reverse();

    const total = await Message.countDocuments({ chat: dmId });

    // Mark messages as read
    dm.unreadCount.set(req.user._id.toString(), 0);
    await dm.save();

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      data: messages
    });

  } catch (error) {
    console.error('Get DM messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send message in DM
// @route   POST /api/dm/:dmId/messages
// @access  Private
const sendDMMessage = async (req, res) => {
  try {
    const { dmId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if DM exists and user is participant
    const dm = await DirectMessage.findById(dmId);
    
    if (!dm) {
      return res.status(404).json({
        success: false,
        message: 'Direct message conversation not found'
      });
    }

    if (!dm.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create message
    const message = await Message.create({
      chat: dmId,
      sender: req.user._id,
      content: content.trim()
    });

    await message.populate('sender', 'username email avatar');

    // Update DM conversation
    dm.lastMessage = message._id;
    
    // Increment unread count for other user
    const otherUserId = dm.participants.find(
      p => p.toString() !== req.user._id.toString()
    ).toString();
    
    const currentUnread = dm.unreadCount.get(otherUserId) || 0;
    dm.unreadCount.set(otherUserId, currentUnread + 1);
    
    await dm.save();

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Send DM message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users (for starting new DM)
// @route   GET /api/dm/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {
      _id: { $ne: req.user._id } // Exclude self
    };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username email avatar isOnline lastSeen')
      .limit(50)
      .sort({ username: 1 });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDirectMessages,
  getOrCreateDM,
  getDMMessages,
  sendDMMessage,
  getUsers
};
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get messages for a chat room
// @route   GET /api/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Check if chat room exists
    const chat = await Chat.findById(roomId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a member of the chat
    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this room'
      });
    }

    // Get messages
    const messages = await Message.find({ chat: roomId })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Reverse to get chronological order
    messages.reverse();

    // Get total count
    const total = await Message.countDocuments({ chat: roomId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      data: messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chat, content } = req.body;

    // Validation
    if (!chat || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide chat ID and message content'
      });
    }

    // Check if chat room exists
    const chatRoom = await Chat.findById(chat);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a member of the chat
    const isMember = chatRoom.members.some(
      member => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this room'
      });
    }

    // Create message
    const message = await Message.create({
      chat,
      sender: req.user._id,
      content
    });

    // Populate sender
    await message.populate('sender', 'username email');

    // Update chat's last message (use updateOne to avoid validation issues)
    try {
      await Chat.updateOne(
        { _id: chat },
        { 
          lastMessage: message._id,
          updatedAt: Date.now()
        }
      );
    } catch (updateError) {
      console.error('Error updating last message:', updateError);
      // Continue even if this fails - message is already saved
    }

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update a message
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    // Update message
    message.content = content;
    message.isEdited = true;
    await message.save();

    await message.populate('sender', 'username email');

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single message
// @route   GET /api/messages/single/:id
// @access  Private
const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username email')
      .populate('chat', 'name');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search messages in a room
// @route   GET /api/messages/:roomId/search
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query'
      });
    }

    // Check if chat room exists
    const chat = await Chat.findById(roomId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a member
    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to search messages in this room'
      });
    }

    // Search messages
    const messages = await Message.find({
      chat: roomId,
      content: { $regex: query, $options: 'i' }
    })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  getMessage,
  searchMessages
};
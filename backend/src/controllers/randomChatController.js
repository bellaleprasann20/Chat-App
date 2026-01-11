const randomChatService = require('../services/randomChatService');
const chatBotService = require('../services/chatBotService');

// @desc    Get random chat queue stats
// @route   GET /api/random/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const stats = randomChatService.getQueueStats();
    const botInfo = chatBotService.getBotInfo();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        bot: botInfo
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check if user is in active chat
// @route   GET /api/random/status
// @access  Private
const getUserStatus = async (req, res) => {
  try {
    const isInChat = randomChatService.isUserInChat(req.user._id.toString());
    const roomId = randomChatService.getRoomByUser(req.user._id.toString());
    const isBot = roomId ? randomChatService.isBotChat(roomId) : false;

    res.status(200).json({
      success: true,
      data: {
        isInChat,
        roomId,
        isBot
      }
    });
  } catch (error) {
    console.error('Get user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getStats,
  getUserStatus
};
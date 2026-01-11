/**
 * Format message for Socket.IO
 * @param {String} username - Sender username
 * @param {String} text - Message text
 * @param {String} userId - User ID
 * @returns {Object} - Formatted message
 */
const formatMessage = (username, text, userId) => {
  return {
    username,
    text,
    userId,
    timestamp: new Date(),
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

/**
 * Format message with full details
 * @param {Object} messageData - Message data
 * @returns {Object} - Formatted message
 */
const formatFullMessage = (messageData) => {
  const { sender, content, chat, messageType = 'text' } = messageData;
  
  return {
    sender: {
      _id: sender._id,
      username: sender.username
    },
    content,
    chat,
    messageType,
    timestamp: new Date(),
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    createdAt: new Date()
  };
};

/**
 * Format system message
 * @param {String} text - System message text
 * @returns {Object} - Formatted system message
 */
const formatSystemMessage = (text) => {
  return {
    username: 'System',
    text,
    userId: 'system',
    messageType: 'system',
    timestamp: new Date(),
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

/**
 * Sanitize message content
 * @param {String} content - Message content
 * @returns {String} - Sanitized content
 */
const sanitizeMessage = (content) => {
  // Remove any potentially harmful HTML/script tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<\s*\/?\s*script\s*>/gi, '')
    .trim();
};

/**
 * Truncate message for preview
 * @param {String} content - Message content
 * @param {Number} maxLength - Maximum length (default: 50)
 * @returns {String} - Truncated content
 */
const truncateMessage = (content, maxLength = 50) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

/**
 * Format time ago
 * @param {Date} date - Date object
 * @returns {String} - Time ago string
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
  
  return 'Just now';
};

module.exports = {
  formatMessage,
  formatFullMessage,
  formatSystemMessage,
  sanitizeMessage,
  truncateMessage,
  timeAgo
};
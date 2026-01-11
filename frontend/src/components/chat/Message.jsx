import React from 'react';

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 max-w-[80%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitial(message.sender?.username || message.username)}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username (only for others' messages) */}
          {!isOwn && (
            <p className="text-xs text-gray-500 mb-1 px-2">
              {message.sender?.username || message.username}
            </p>
          )}

          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-200 text-gray-800 rounded-bl-md'
            } shadow-sm`}
          >
            <p className="text-sm break-words whitespace-pre-wrap">{message.content || message.text}</p>
          </div>

          {/* Timestamp */}
          <p className={`text-xs text-gray-400 mt-1 px-2`}>
            {formatTime(message.createdAt || message.timestamp)}
          </p>
        </div>

        {/* Avatar for own messages */}
        {isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitial(message.sender?.username || message.username)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
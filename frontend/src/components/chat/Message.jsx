import React from 'react';

const GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-indigo-500 to-blue-400',
];

const gradientFor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const username = message.sender?.username || message.username || 'Unknown';
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');
  const avatarGradient = gradientFor(username);

  return (
    <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-end space-x-2 max-w-[80%] sm:max-w-[65%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <span className="text-white text-xs font-semibold">
              {getInitial(username)}
            </span>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
          {!isOwn && (
            <p className="text-xs font-medium text-gray-500 mb-1 px-1 truncate max-w-full">
              {username}
            </p>
          )}

          <div
            className={`px-4 py-2.5 shadow-sm transition-transform group-hover:scale-[1.01] ${
              isOwn
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                : 'bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-bl-md'
            }`}
          >
            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
              {message.content || message.text}
            </p>
          </div>

          <p className="text-[11px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt || message.timestamp)}
          </p>
        </div>

        {/* Avatar for own messages */}
        {isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-semibold">
              {getInitial(username)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
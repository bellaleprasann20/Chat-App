import React, { useEffect, useRef, useState } from 'react';
import { Users, X, ArrowLeft, MessageCircle } from 'lucide-react';
import Message from './Message';
import MessageInput from './MessageInput';
import { useAuth } from '../../hooks/useAuth';

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

const ChatBox = ({ room, messages, onSendMessage, onlineUsers, onBack }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showUsers, setShowUsers] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const roomGradient = gradientFor(room?.name);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition active:scale-95 flex-shrink-0"
          >
            <ArrowLeft size={19} className="text-gray-600" />
          </button>
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`w-10 h-10 flex-shrink-0 bg-gradient-to-br ${roomGradient} rounded-xl flex items-center justify-center shadow-sm`}>
              <span className="text-white font-bold text-sm">
                {room?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate leading-tight">{room?.name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {onlineUsers?.length || 0} online
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUsers(!showUsers)}
          className="relative p-2.5 hover:bg-gray-100 rounded-full transition active:scale-95 flex-shrink-0"
        >
          <Users size={19} className="text-gray-600" />
          {onlineUsers?.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {onlineUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className={`w-16 h-16 bg-gradient-to-br ${roomGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg opacity-90`}>
                <MessageCircle size={26} className="text-white" />
              </div>
              <p className="text-gray-700 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Say hello and get the conversation going</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <Message
                key={msg._id || msg.id}
                message={msg}
                isOwn={msg.sender?._id === user?._id || msg.sender?.id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <MessageInput onSendMessage={onSendMessage} />

      {/* Online Users Sidebar */}
      {showUsers && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
          onClick={() => setShowUsers(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-5 bg-gradient-to-r ${roomGradient} flex items-center justify-between flex-shrink-0`}>
              <div>
                <h3 className="font-semibold text-white text-lg">Members Online</h3>
                <p className="text-white/80 text-sm">{onlineUsers?.length || 0} people here right now</p>
              </div>
              <button
                onClick={() => setShowUsers(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-3 space-y-1 overflow-y-auto flex-1">
              {onlineUsers && onlineUsers.length > 0 ? (
                onlineUsers.map((u) => (
                  <div
                    key={u._id || u.id}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 bg-gradient-to-br ${gradientFor(u.username)} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{u.username}</p>
                      <p className="text-xs text-emerald-600 font-medium">Online</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <Users size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No one online right now</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
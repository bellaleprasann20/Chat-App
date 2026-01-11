import React, { useEffect, useRef } from 'react';
import { Users, X, ArrowLeft } from 'lucide-react';
import Message from './Message';
import MessageInput from './MessageInput';
import { useAuth } from '../../hooks/useAuth';

const ChatBox = ({ room, messages, onSendMessage, onlineUsers, onBack }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showUsers, setShowUsers] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {room.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{room.name}</h2>
              <p className="text-xs text-gray-500">
                {onlineUsers?.length || 0} online
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="p-2 hover:bg-gray-100 rounded-lg transition relative active:scale-95"
        >
          <Users size={20} className="text-gray-600" />
          {onlineUsers?.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
          )}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Be the first to say hello!</p>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50" 
          onClick={() => setShowUsers(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-between">
              <h3 className="font-semibold text-white">Online Users</h3>
              <button 
                onClick={() => setShowUsers(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              {onlineUsers && onlineUsers.length > 0 ? (
                onlineUsers.map((u) => (
                  <div key={u._id || u.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{u.username}</p>
                      <p className="text-xs text-green-600">Online</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No users online</p>
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
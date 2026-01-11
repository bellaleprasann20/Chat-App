import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Circle, MoreVertical, Phone, Video } from 'lucide-react';
import Loader from '../components/common/Loader';
import Message from '../components/chat/Message';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import socket from '../services/socket';

const DirectMessageChat = () => {
  const { dmId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [dm, setDM] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!dmId) {
      navigate('/messages');
      return;
    }

    fetchDMData();
    setupSocketListeners();

    return () => {
      cleanupSocket();
    };
  }, [dmId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDMData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch DM details
      const dmResponse = await api.get(`/dm/${dmId}/messages`);
      const messagesData = dmResponse.data.data || dmResponse.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      // Get DM conversation details to find other user
      const dmListResponse = await api.get('/dm');
      const allDMs = dmListResponse.data.data || dmListResponse.data || [];
      const currentDM = allDMs.find(d => d._id === dmId);
      
      if (currentDM) {
        setOtherUser(currentDM.otherUser);
      }

      // Join DM room via socket
      socket.emit('joinDM', { dmId });

    } catch (err) {
      console.error('Failed to fetch DM data:', err);
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    socket.on('dmMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicator
    socket.on('dmTypingIndicator', ({ isTyping: typing }) => {
      setIsTyping(typing);
      
      if (typing) {
        // Clear typing after 3 seconds
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Listen for new DM notifications
    socket.on('newDMNotification', (notification) => {
      console.log('New DM notification:', notification);
    });
  };

  const cleanupSocket = () => {
    socket.emit('leaveDM', { dmId });
    socket.off('dmMessage');
    socket.off('dmTypingIndicator');
    socket.off('newDMNotification');
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || sending) return;

    try {
      setSending(true);

      // Send via socket for real-time
      socket.emit('sendDMMessage', {
        dmId,
        content: trimmedMessage,
        recipientId: otherUser?._id
      });

      // Also save to database
      await api.post(`/dm/${dmId}/messages`, {
        content: trimmedMessage
      });

      setInputMessage('');
      
      // Stop typing indicator
      socket.emit('dmTyping', { dmId, isTyping: false });

    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Emit typing indicator
    socket.emit('dmTyping', { dmId, isTyping: e.target.value.length > 0 });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('dmTyping', { dmId, isTyping: false });
    }, 2000);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return <Loader fullScreen message="Loading conversation..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition active:scale-95"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            
            {otherUser && (
              <>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </div>
                  {otherUser.isOnline && (
                    <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div>
                  <h2 className="font-semibold text-gray-800">{otherUser.username}</h2>
                  <p className="text-xs text-gray-500">
                    {otherUser.isOnline ? 'Online' : `Last seen ${formatLastSeen(otherUser.lastSeen)}`}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95">
              <Video size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Send a message to start the conversation</p>
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
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500">{otherUser?.username} is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherUser?.username || 'user'}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sending}
              className={`p-3 rounded-full transition active:scale-95 ${
                inputMessage.trim() && !sending
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="absolute right-4 top-16 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition">
              View Profile
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition">
              Search in Conversation
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition">
              Mute Notifications
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">
              Delete Conversation
            </button>
            <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition">
              Block User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessageChat;
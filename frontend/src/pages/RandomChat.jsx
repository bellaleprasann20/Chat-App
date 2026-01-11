import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Shuffle, Circle, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';

const RandomChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('idle'); // idle, searching, chatting, disconnected
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [isBot, setIsBot] = useState(false);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setupSocketListeners();
    
    return () => {
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupSocketListeners = () => {
    // Stranger connected
    socket.on('strangerConnected', ({ roomId: newRoomId, isBot: botStatus, message }) => {
      setStatus('chatting');
      setRoomId(newRoomId);
      setIsBot(botStatus);
      setMessages([{ 
        type: 'system', 
        content: message,
        isBot: botStatus 
      }]);
    });

    // Searching for stranger
    socket.on('searchingForStranger', ({ message, queuePosition: position }) => {
      setStatus('searching');
      setQueuePosition(position);
      setMessages([{ 
        type: 'system', 
        content: message 
      }]);
    });

    // Message received
    socket.on('randomMessage', ({ content, isBot: fromBot, isYou, timestamp }) => {
      setMessages(prev => [...prev, {
        type: 'message',
        content,
        isYou,
        isBot: fromBot,
        timestamp
      }]);
    });

    // Stranger disconnected
    socket.on('strangerDisconnected', ({ message }) => {
      setStatus('disconnected');
      setMessages(prev => [...prev, {
        type: 'system',
        content: message
      }]);
    });

    // Stranger skipped
    socket.on('strangerSkipped', () => {
      setStatus('idle');
      setMessages([]);
      setRoomId(null);
      setIsBot(false);
    });

    // Typing indicator
    socket.on('strangerTyping', ({ isTyping }) => {
      setStrangerTyping(isTyping);
      
      if (isTyping) {
        setTimeout(() => setStrangerTyping(false), 3000);
      }
    });

    // Searching stopped
    socket.on('searchingStopped', () => {
      setStatus('idle');
      setMessages([]);
    });
  };

  const cleanupSocket = () => {
    socket.off('strangerConnected');
    socket.off('searchingForStranger');
    socket.off('randomMessage');
    socket.off('strangerDisconnected');
    socket.off('strangerSkipped');
    socket.off('strangerTyping');
    socket.off('searchingStopped');
    
    if (status === 'searching' || status === 'chatting') {
      socket.emit('stopSearching');
    }
  };

  const startChat = (interests = []) => {
    socket.emit('findRandomStranger', { interests });
    setStatus('searching');
    setMessages([{ type: 'system', content: 'Looking for someone to chat with...' }]);
  };

  const skipStranger = () => {
    socket.emit('skipStranger');
    setMessages([]);
    setStrangerTyping(false);
    // Auto start new search
    setTimeout(() => startChat(), 500);
  };

  const stopSearching = () => {
    socket.emit('stopSearching');
    setStatus('idle');
    setMessages([]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || status !== 'chatting') return;

    socket.emit('sendRandomMessage', {
      roomId,
      content: inputMessage.trim()
    });

    setInputMessage('');
    
    // Stop typing indicator
    socket.emit('randomChatTyping', { roomId, isTyping: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (status === 'chatting' && !isBot) {
      socket.emit('randomChatTyping', { 
        roomId, 
        isTyping: e.target.value.length > 0 
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('randomChatTyping', { roomId, isTyping: false });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar title="Random Chat" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-2">
              {status === 'chatting' && (
                <>
                  {isBot ? (
                    <div className="flex items-center space-x-2 bg-purple-500 bg-opacity-30 px-3 py-1 rounded-full">
                      <Bot size={16} className="text-purple-300" />
                      <span className="text-white text-sm">AI Bot</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-green-500 bg-opacity-30 px-3 py-1 rounded-full">
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                      <span className="text-white text-sm">Stranger</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area or Start Screen */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {status === 'idle' ? (
            // Start Screen
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shuffle size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Talk to Strangers
                </h2>
                <p className="text-blue-200 mb-8">
                  Connect with random people around the world. Click start to begin chatting anonymously!
                </p>
                <button
                  onClick={() => startChat()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition shadow-lg active:scale-95"
                >
                  Start Chatting
                </button>
                <p className="text-blue-300 text-sm mt-4">
                  • Be respectful • Stay safe • Have fun •
                </p>
              </div>
            </div>
          ) : (
            // Chat Interface
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-white">Connecting...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div key={index}>
                        {msg.type === 'system' ? (
                          <div className="flex justify-center">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                              <p className="text-white text-sm text-center">
                                {msg.content}
                                {msg.isBot && ' 🤖'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className={`flex ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-3 shadow-lg ${
                              msg.isYou 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' 
                                : msg.isBot
                                ? 'bg-purple-600 text-white rounded-2xl rounded-bl-md'
                                : 'bg-white text-gray-900 rounded-2xl rounded-bl-md'
                            }`}>
                              <p className="break-words text-sm">{msg.content}</p>
                              {msg.isBot && (
                                <p className="text-xs mt-1 opacity-80">🤖 AI Bot</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {strangerTyping && !isBot && (
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {status === 'chatting' && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      autoComplete="off"
                      spellCheck="true"
                      className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-blue-400 rounded-full placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim()}
                      className={`p-3 rounded-full transition ${
                        inputMessage.trim()
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  
                  <button
                    onClick={skipStranger}
                    className="w-full py-2 bg-red-500 bg-opacity-80 hover:bg-red-600 text-white rounded-lg font-semibold transition active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Shuffle size={18} />
                      <span>Skip to Next Stranger</span>
                    </div>
                  </button>
                </div>
              )}

              {status === 'searching' && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20 p-4">
                  <div className="text-center mb-3">
                    <div className="animate-pulse text-white mb-2">
                      Searching for someone...
                    </div>
                    <div className="text-blue-200 text-sm">
                      {queuePosition > 0 ? `${queuePosition} users in queue` : 'Looking for a match'}
                    </div>
                  </div>
                  <button
                    onClick={stopSearching}
                    className="w-full py-3 bg-red-500 bg-opacity-80 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                  >
                    Stop Searching
                  </button>
                </div>
              )}

              {status === 'disconnected' && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20 p-4">
                  <button
                    onClick={() => startChat()}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition"
                  >
                    Find New Stranger
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomChat;
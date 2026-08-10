import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Shuffle, Circle, Bot, Sparkles, ShieldCheck, Zap } from 'lucide-react';
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
    return () => cleanupSocket();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupSocketListeners = () => {
    socket.on('strangerConnected', ({ roomId: newRoomId, isBot: botStatus, message }) => {
      setStatus('chatting');
      setRoomId(newRoomId);
      setIsBot(botStatus);
      setMessages([{ type: 'system', content: message, isBot: botStatus }]);
    });

    socket.on('searchingForStranger', ({ message, queuePosition: position }) => {
      setStatus('searching');
      setQueuePosition(position);
      setMessages([{ type: 'system', content: message }]);
    });

    socket.on('randomMessage', ({ content, isBot: fromBot, isYou, timestamp }) => {
      setMessages(prev => [...prev, { type: 'message', content, isYou, isBot: fromBot, timestamp }]);
    });

    socket.on('strangerDisconnected', ({ message }) => {
      setStatus('disconnected');
      setMessages(prev => [...prev, { type: 'system', content: message }]);
    });

    socket.on('strangerSkipped', () => {
      setStatus('idle');
      setMessages([]);
      setRoomId(null);
      setIsBot(false);
    });

    socket.on('strangerTyping', ({ isTyping }) => {
      setStrangerTyping(isTyping);
      if (isTyping) setTimeout(() => setStrangerTyping(false), 3000);
    });

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
    setTimeout(() => startChat(), 500);
  };

  const stopSearching = () => {
    socket.emit('stopSearching');
    setStatus('idle');
    setMessages([]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || status !== 'chatting') return;
    socket.emit('sendRandomMessage', { roomId, content: inputMessage.trim() });
    setInputMessage('');
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
      socket.emit('randomChatTyping', { roomId, isTyping: e.target.value.length > 0 });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('randomChatTyping', { roomId, isTyping: false });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <Navbar title="Random Chat" />

        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto min-h-0">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition text-sm"
              >
                <ArrowLeft size={18} />
                <span>Home</span>
              </button>

              {status === 'chatting' && (
                isBot ? (
                  <div className="flex items-center space-x-1.5 bg-purple-500/20 border border-purple-400/30 px-3 py-1.5 rounded-full">
                    <Bot size={14} className="text-purple-300" />
                    <span className="text-purple-100 text-xs font-medium">AI Bot</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full">
                    <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                    <span className="text-emerald-100 text-xs font-medium">Stranger</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {status === 'idle' ? (
              /* Start Screen */
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse opacity-30 blur-xl" />
                    <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500/90 to-purple-600/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Shuffle size={44} className="text-white" />
                    </div>
                    <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-300" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-3">
                    Talk to Strangers
                  </h2>
                  <p className="text-indigo-200/80 mb-8 leading-relaxed">
                    Get matched instantly with someone new. If no one's around, our AI jumps in so you're never left waiting.
                  </p>

                  <button
                    onClick={() => startChat()}
                    className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all shadow-lg active:scale-95"
                  >
                    Start Chatting
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-6 text-xs text-indigo-300/70">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>Anonymous</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={13} />
                      <span>Instant match</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-14 h-14 border-[3px] border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/60 text-sm">Connecting...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <div key={index} className="animate-fade-in">
                          {msg.type === 'system' ? (
                            <div className="flex justify-center py-1">
                              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full">
                                <p className="text-indigo-100 text-xs text-center">
                                  {msg.content}{msg.isBot && ' 🤖'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className={`flex items-end gap-2 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                              {!msg.isYou && (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white ${msg.isBot ? 'bg-purple-500' : 'bg-slate-600'}`}>
                                  {msg.isBot ? 'AI' : 'S'}
                                </div>
                              )}
                              <div className={`max-w-[70%] px-4 py-2.5 shadow-lg ${
                                msg.isYou
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                                  : msg.isBot
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl rounded-bl-md'
                                  : 'bg-white text-gray-900 rounded-2xl rounded-bl-md'
                              }`}>
                                <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {strangerTyping && !isBot && (
                        <div className="flex items-end gap-2 justify-start">
                          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">S</div>
                          <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
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
                  <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 flex-shrink-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        autoComplete="off"
                        className="flex-1 px-4 py-3 bg-white text-gray-900 rounded-full placeholder-gray-400 focus:ring-2 focus:ring-blue-400 outline-none shadow-inner"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim()}
                        className={`p-3 rounded-full transition flex-shrink-0 ${
                          inputMessage.trim()
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        <Send size={19} />
                      </button>
                    </div>

                    <button
                      onClick={skipStranger}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full font-medium text-sm transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Shuffle size={15} />
                      <span>Skip to Next Stranger</span>
                    </button>
                  </div>
                )}

                {status === 'searching' && (
                  <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-6 flex-shrink-0">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping" />
                        <div className="absolute inset-2 rounded-full border-2 border-purple-400/40 animate-ping" style={{ animationDelay: '0.3s' }} />
                        <div className="absolute inset-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-white font-medium mb-1">Searching for someone...</p>
                      <p className="text-indigo-300 text-xs">
                        {queuePosition > 0 ? `${queuePosition} users in queue` : "We'll connect you with AI if no one's free"}
                      </p>
                    </div>
                    <button
                      onClick={stopSearching}
                      className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-full font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {status === 'disconnected' && (
                  <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 flex-shrink-0">
                    <button
                      onClick={() => startChat()}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all"
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
    </div>
  );
};

export default RandomChat;
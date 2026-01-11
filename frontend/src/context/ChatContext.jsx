import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import socket from '../services/socket';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useContext(AuthContext);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && token) {
      connectSocket();
      setupSocketListeners();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user, token]);

  const connectSocket = () => {
    if (!socket.connected && token) {
      // Set auth token
      socket.auth = { token };
      socket.connect();
    }
  };

  const disconnectSocket = () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

  const setupSocketListeners = () => {
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Message events
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      // Add notification if not in current room
      if (currentRoom?._id !== message.chat) {
        addNotification({
          id: Date.now(),
          type: 'message',
          message: `New message in ${message.chatName}`,
          from: message.sender.username
        });
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Online users events
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // User joined/left events
    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
      addNotification({
        id: Date.now(),
        type: 'info',
        message: `${data.username} joined the room`
      });
    });

    socket.on('userLeft', (data) => {
      console.log('User left:', data);
      addNotification({
        id: Date.now(),
        type: 'info',
        message: `${data.username} left the room`
      });
    });

    // Error events
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      addNotification({
        id: Date.now(),
        type: 'error',
        message: error.message || 'An error occurred'
      });
    });
  };

  const joinRoom = (roomId) => {
    if (socket.connected && user) {
      socket.emit('joinRoom', { roomId, userId: user._id || user.id });
      setCurrentRoom({ _id: roomId });
      setMessages([]);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket.connected) {
      socket.emit('leaveRoom', roomId);
      setCurrentRoom(null);
      setMessages([]);
    }
  };

  const sendMessage = (roomId, content) => {
    if (socket.connected && user) {
      const messageData = {
        roomId,
        content,
        sender: user._id || user.id,
        timestamp: new Date().toISOString()
      };
      socket.emit('sendMessage', messageData);
    }
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const value = {
    currentRoom,
    messages,
    onlineUsers,
    notifications,
    unreadCount,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    setCurrentRoom,
    setMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
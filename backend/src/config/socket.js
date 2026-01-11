const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, SOCKET_CORS_ORIGIN } = require('./env');
const User = require('../models/User');
const randomChatService = require('../services/randomChatService');
const chatBotService = require('../services/chatBotService');


// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Store room members: { roomId: Set of userIds }
const roomMembers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: SOCKET_CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.userId = user._id.toString();
      socket.username = user.username;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);
    
    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);
    
    // Emit online users count
    io.emit('onlineUsersCount', onlineUsers.size);

    // Join room event
    socket.on('joinRoom', async ({ roomId, userId }) => {
      try {
        socket.join(roomId);
        
        // Add user to room members
        if (!roomMembers.has(roomId)) {
          roomMembers.set(roomId, new Set());
        }
        roomMembers.get(roomId).add(socket.userId);

        console.log(`👤 ${socket.username} joined room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('userJoined', {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date()
        });

        // Send current online users in the room
        const roomUserIds = Array.from(roomMembers.get(roomId) || []);
        const roomUsers = roomUserIds
          .filter(id => onlineUsers.has(id))
          .map(id => ({ 
            _id: id, 
            id: id,
            username: socket.username 
          }));
        
        io.to(roomId).emit('onlineUsers', roomUsers);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room event
    socket.on('leaveRoom', (roomId) => {
      try {
        socket.leave(roomId);
        
        // Remove user from room members
        if (roomMembers.has(roomId)) {
          roomMembers.get(roomId).delete(socket.userId);
          
          // Clean up empty room
          if (roomMembers.get(roomId).size === 0) {
            roomMembers.delete(roomId);
          }
        }

        console.log(`👤 ${socket.username} left room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('userLeft', {
          userId: socket.userId,
          username: socket.username,
          timestamp: new Date()
        });

        // Update online users in the room
        if (roomMembers.has(roomId)) {
          const roomUserIds = Array.from(roomMembers.get(roomId));
          const roomUsers = roomUserIds
            .filter(id => onlineUsers.has(id))
            .map(id => ({ 
              _id: id,
              id: id, 
              username: socket.username 
            }));
          
          io.to(roomId).emit('onlineUsers', roomUsers);
        }

      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Send message event
    socket.on('sendMessage', async (messageData) => {
      try {
        const { roomId, content, sender } = messageData;

        // Create message object
        const message = {
          _id: Date.now().toString(),
          chat: roomId,
          content,
          sender: {
            _id: sender,
            id: sender,
            username: socket.username
          },
          createdAt: new Date(),
          timestamp: new Date()
        };

        // Broadcast message to all users in the room
        io.to(roomId).emit('message', message);

        console.log(`💬 Message sent in room ${roomId} by ${socket.username}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator event
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
      
      // Remove user from online users
      onlineUsers.delete(socket.userId);
      
      // Remove user from all rooms
      roomMembers.forEach((members, roomId) => {
        if (members.has(socket.userId)) {
          members.delete(socket.userId);
          
          // Notify room members
          io.to(roomId).emit('userLeft', {
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date()
          });

          // Update online users in the room
          const roomUserIds = Array.from(members);
          const roomUsers = roomUserIds
            .filter(id => onlineUsers.has(id))
            .map(id => ({ 
              _id: id,
              id: id, 
              username: socket.username 
            }));
          
          io.to(roomId).emit('onlineUsers', roomUsers);
          
          // Clean up empty room
          if (members.size === 0) {
            roomMembers.delete(roomId);
          }
        }
      });

      // Emit updated online users count
      io.emit('onlineUsersCount', onlineUsers.size);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  
// Add these socket events inside io.on('connection', (socket) => { ... })

// ============================================
// RANDOM CHAT EVENTS
// ============================================

// Find random stranger
socket.on('findRandomStranger', async ({ interests }) => {
  try {
    // Add to queue
    randomChatService.addToQueue(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      interests: interests || []
    });

    // Try to find match
    const match = randomChatService.findMatch(socket.userId);

    if (match) {
      // Found a real user!
      const currentUser = {
        userId: socket.userId,
        socketId: socket.id,
        username: socket.username
      };

      const roomId = randomChatService.createRandomChat(currentUser, match);

      // Join both users to room
      socket.join(roomId);
      io.sockets.sockets.get(match.socketId)?.join(roomId);

      // Notify both users
      socket.emit('strangerConnected', {
        roomId,
        isBot: false,
        message: 'You are now chatting with a random stranger!'
      });

      io.to(match.socketId).emit('strangerConnected', {
        roomId,
        isBot: false,
        message: 'You are now chatting with a random stranger!'
      });

      console.log(`✅ Matched ${socket.username} with ${match.username}`);
    } else {
      // No match, keep searching
      socket.emit('searchingForStranger', {
        message: 'Looking for someone to chat with...',
        queuePosition: randomChatService.getQueueStats().waiting
      });

      // After 10 seconds, connect to bot if still no match
      setTimeout(() => {
        if (!randomChatService.isUserInChat(socket.userId)) {
          const botRoomId = randomChatService.createBotChat(socket.userId);
          socket.join(botRoomId);

          socket.emit('strangerConnected', {
            roomId: botRoomId,
            isBot: true,
            message: 'Connected to AI Bot! (No users available)'
          });

          // Send bot greeting
          setTimeout(async () => {
            const greeting = await chatBotService.getBotResponse(botRoomId, 'Hi');
            socket.emit('randomMessage', {
              content: greeting,
              isBot: true,
              isYou: false,
              timestamp: new Date()
            });
          }, 1000);

          console.log(`🤖 Connected ${socket.username} to bot`);
        }
      }, 10000);
    }
  } catch (error) {
    console.error('Find stranger error:', error);
    socket.emit('error', { message: 'Failed to find stranger' });
  }
});

// Stop searching
socket.on('stopSearching', () => {
  randomChatService.removeFromQueue(socket.userId);
  socket.emit('searchingStopped');
});

// Skip current stranger
socket.on('skipStranger', () => {
  const roomId = randomChatService.getRoomByUser(socket.userId);
  if (!roomId) return;

  const isBot = randomChatService.isBotChat(roomId);
  const partner = randomChatService.getPartner(socket.userId);

  // End current chat
  randomChatService.endChat(socket.userId);
  
  if (isBot) {
    chatBotService.clearHistory(roomId);
  }

  socket.leave(roomId);

  // Notify partner if real user
  if (partner && partner !== 'bot') {
    io.to(partner).emit('strangerDisconnected', {
      message: 'Stranger has disconnected.'
    });
    randomChatService.endChat(partner);
  }

  // Emit event to start new search
  socket.emit('strangerSkipped');
});

// Send message in random chat
socket.on('sendRandomMessage', async ({ roomId, content }) => {
  try {
    const isBot = randomChatService.isBotChat(roomId);

    if (isBot) {
      // Send to self
      socket.emit('randomMessage', {
        content,
        isBot: false,
        isYou: true,
        timestamp: new Date()
      });

      // Get bot response
      const botResponse = await chatBotService.getBotResponse(roomId, content);

      // Send bot response after short delay
      setTimeout(() => {
        socket.emit('randomMessage', {
          content: botResponse,
          isBot: true,
          isYou: false,
          timestamp: new Date()
        });
      }, 1000 + Math.random() * 1000); // 1-2 second delay
    } else {
      // Send to partner
      socket.to(roomId).emit('randomMessage', {
        content,
        isBot: false,
        isYou: false,
        timestamp: new Date()
      });

      // Send back to sender
      socket.emit('randomMessage', {
        content,
        isBot: false,
        isYou: true,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Send random message error:', error);
  }
});

// Typing indicator for random chat
socket.on('randomChatTyping', ({ roomId, isTyping }) => {
  const isBot = randomChatService.isBotChat(roomId);
  if (!isBot) {
    socket.to(roomId).emit('strangerTyping', { isTyping });
  }
});

// When user disconnects
// (Add this to existing disconnect handler)
const existingDisconnectHandler = socket.on('disconnect', () => {
  // ... existing disconnect code ...
  
  // Add random chat cleanup
  randomChatService.removeFromQueue(socket.userId);
  
  const roomId = randomChatService.getRoomByUser(socket.userId);
  if (roomId) {
    const isBot = randomChatService.isBotChat(roomId);
    const partner = randomChatService.getPartner(socket.userId);
    
    if (isBot) {
      chatBotService.clearHistory(roomId);
    } else if (partner && partner !== 'bot') {
      io.to(partner).emit('strangerDisconnected', {
        message: 'Stranger has disconnected.'
      });
    }
    
    randomChatService.endChat(socket.userId);
  }
});
  });

  return io;
};

module.exports = setupSocket;
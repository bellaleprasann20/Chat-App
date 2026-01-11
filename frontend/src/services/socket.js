import { io } from 'socket.io-client';

// Socket.IO configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance with configuration
const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect automatically
  reconnection: true, // Enable reconnection
  reconnectionAttempts: 5, // Number of reconnection attempts
  reconnectionDelay: 1000, // Delay between reconnection attempts
  reconnectionDelayMax: 5000, // Maximum delay between reconnections
  timeout: 20000, // Connection timeout
  transports: ['websocket', 'polling'], // Transport methods
});

// Connection event listeners
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected, manually reconnect
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
  
  // Handle authentication errors
  if (error.message === 'Authentication error') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Attempting to reconnect...', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Failed to reconnect after all attempts');
});

// Helper functions
export const connectSocket = () => {
  if (!socket.connected) {
    const token = localStorage.getItem('token');
    if (token) {
      // Set auth token before connecting
      socket.auth = { token };
      socket.connect();
    } else {
      console.error('No token found. Cannot connect to socket.');
    }
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinRoom = (roomId, userId) => {
  socket.emit('joinRoom', { roomId, userId });
};

export const leaveRoom = (roomId) => {
  socket.emit('leaveRoom', roomId);
};

export const sendMessage = (messageData) => {
  socket.emit('sendMessage', messageData);
};

export const emitTyping = (roomId, isTyping) => {
  socket.emit('typing', { roomId, isTyping });
};

// Socket event listeners setup
export const setupSocketListeners = (callbacks) => {
  const {
    onMessage,
    onUserJoined,
    onUserLeft,
    onOnlineUsers,
    onTyping,
    onError
  } = callbacks;

  if (onMessage) {
    socket.on('message', onMessage);
  }

  if (onUserJoined) {
    socket.on('userJoined', onUserJoined);
  }

  if (onUserLeft) {
    socket.on('userLeft', onUserLeft);
  }

  if (onOnlineUsers) {
    socket.on('onlineUsers', onOnlineUsers);
  }

  if (onTyping) {
    socket.on('typing', onTyping);
  }

  if (onError) {
    socket.on('error', onError);
  }
};

// Clean up socket listeners
export const removeSocketListeners = () => {
  socket.off('message');
  socket.off('userJoined');
  socket.off('userLeft');
  socket.off('onlineUsers');
  socket.off('typing');
  socket.off('error');
};

// Get socket connection status
export const isSocketConnected = () => socket.connected;

// Get socket ID
export const getSocketId = () => socket.id;

export default socket;
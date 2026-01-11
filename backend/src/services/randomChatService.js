class RandomChatService {
  constructor() {
    // Queue of users waiting for a match
    this.waitingQueue = new Map(); // userId -> userData
    
    // Active random chat rooms
    this.activeChats = new Map(); // roomId -> {user1, user2, isBot}
    
    // User to room mapping
    this.userToRoom = new Map(); // userId -> roomId
    
    // Bot conversations
    this.botChats = new Set(); // roomIds with bot
  }

  // Add user to waiting queue
  addToQueue(userId, userData) {
    this.waitingQueue.set(userId, {
      userId,
      socketId: userData.socketId,
      username: userData.username,
      interests: userData.interests || [],
      joinedAt: Date.now()
    });

    console.log(`👤 User ${userData.username} joined random chat queue. Queue size: ${this.waitingQueue.size}`);
  }

  // Remove user from queue
  removeFromQueue(userId) {
    const removed = this.waitingQueue.delete(userId);
    if (removed) {
      console.log(`👋 User removed from queue. Queue size: ${this.waitingQueue.size}`);
    }
    return removed;
  }

  // Find a match for user
  findMatch(userId) {
    const currentUser = this.waitingQueue.get(userId);
    if (!currentUser) return null;

    let bestMatch = null;
    let bestScore = -1;

    // Iterate through queue to find best match
    for (const [otherUserId, otherUser] of this.waitingQueue) {
      if (otherUserId === userId) continue;

      const score = this.calculateMatchScore(currentUser, otherUser);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = otherUser;
      }
    }

    // If waiting too long (>10 seconds), match with anyone
    const waitTime = Date.now() - currentUser.joinedAt;
    if (waitTime > 10000 && bestMatch) {
      return bestMatch;
    }

    // Return match if score is good enough
    if (bestScore > 0.3) {
      return bestMatch;
    }

    return null;
  }

  // Calculate match score based on interests
  calculateMatchScore(user1, user2) {
    let score = 0;

    // Common interests (0-1 point)
    const commonInterests = user1.interests.filter(i => 
      user2.interests.includes(i)
    );
    score += commonInterests.length * 0.2;

    // Wait time factor (longer wait = more lenient matching)
    const avgWaitTime = (
      (Date.now() - user1.joinedAt) + 
      (Date.now() - user2.joinedAt)
    ) / 2;
    
    if (avgWaitTime > 30000) { // 30 seconds
      score += 0.5;
    }

    return Math.min(score, 1); // Cap at 1
  }

  // Create a random chat room for two users
  createRandomChat(user1, user2) {
    const roomId = `random_${user1.userId}_${user2.userId}_${Date.now()}`;

    this.activeChats.set(roomId, {
      user1: user1.userId,
      user2: user2.userId,
      isBot: false,
      createdAt: Date.now()
    });

    this.userToRoom.set(user1.userId, roomId);
    this.userToRoom.set(user2.userId, roomId);

    // Remove from queue
    this.removeFromQueue(user1.userId);
    this.removeFromQueue(user2.userId);

    console.log(`💬 Random chat created: ${roomId}`);

    return roomId;
  }

  // Create a bot chat for user
  createBotChat(userId) {
    const roomId = `bot_${userId}_${Date.now()}`;

    this.activeChats.set(roomId, {
      user1: userId,
      user2: 'bot',
      isBot: true,
      createdAt: Date.now()
    });

    this.userToRoom.set(userId, roomId);
    this.botChats.add(roomId);

    // Remove from queue
    this.removeFromQueue(userId);

    console.log(`🤖 Bot chat created: ${roomId}`);

    return roomId;
  }

  // Check if room is bot chat
  isBotChat(roomId) {
    return this.botChats.has(roomId);
  }

  // Get partner in random chat
  getPartner(userId) {
    const roomId = this.userToRoom.get(userId);
    if (!roomId) return null;

    const chat = this.activeChats.get(roomId);
    if (!chat) return null;

    return chat.user1 === userId ? chat.user2 : chat.user1;
  }

  // Get room by user ID
  getRoomByUser(userId) {
    return this.userToRoom.get(userId);
  }

  // End random chat
  endChat(userId) {
    const roomId = this.userToRoom.get(userId);
    if (!roomId) return null;

    const chat = this.activeChats.get(roomId);
    if (!chat) return null;
    
    // Clean up
    this.activeChats.delete(roomId);
    this.botChats.delete(roomId);
    
    if (chat.user1 !== 'bot') {
      this.userToRoom.delete(chat.user1);
    }
    if (chat.user2 !== 'bot') {
      this.userToRoom.delete(chat.user2);
    }

    console.log(`❌ Random chat ended: ${roomId}`);

    return {
      roomId,
      partner: this.getPartner(userId),
      isBot: chat.isBot
    };
  }

  // Get queue stats
  getQueueStats() {
    return {
      waiting: this.waitingQueue.size,
      activeChats: this.activeChats.size,
      botChats: this.botChats.size
    };
  }

  // Check if user is in chat
  isUserInChat(userId) {
    return this.userToRoom.has(userId);
  }
}

module.exports = new RandomChatService();
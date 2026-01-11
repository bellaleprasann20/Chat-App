const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
directMessageSchema.index({ participants: 1 });
directMessageSchema.index({ updatedAt: -1 });

// Ensure exactly 2 participants
directMessageSchema.pre('save', function () {
  if (this.participants.length !== 2) {
    throw new Error('Direct message must have exactly 2 participants');
  }
});

// Static method to find or create DM between two users
directMessageSchema.statics.findOrCreate = async function (user1Id, user2Id) {
  // Ensure consistent ordering to prevent duplicates
  const participants = [user1Id, user2Id].sort();
  
  let dm = await this.findOne({
    participants: { $all: participants }
  }).populate('participants', 'username email avatar isOnline lastSeen')
    .populate('lastMessage');

  if (!dm) {
    dm = await this.create({
      participants,
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0
      }
    });
    
    dm = await dm.populate('participants', 'username email avatar isOnline lastSeen');
  }

  return dm;
};

module.exports = mongoose.model('DirectMessage', directMessageSchema);
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a chat room name'],
      unique: true,
      trim: true,
      minlength: [3, 'Chat room name must be at least 3 characters'],
      maxlength: [50, 'Chat room name cannot exceed 50 characters']
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['general', 'tech', 'random', 'gaming', 'music', 'sports', 'other'],
      default: 'general'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
chatSchema.index({ name: 1 });
chatSchema.index({ creator: 1 });
chatSchema.index({ members: 1 });
chatSchema.index({ createdAt: -1 });

// Virtual for member count
chatSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

// Ensure virtuals are included when converting to JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

// Pre-remove hook to delete associated messages
chatSchema.pre('remove', async function (next) {
  await this.model('Message').deleteMany({ chat: this._id });
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
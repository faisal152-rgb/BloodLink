const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    default: 'general',
  },
  title: {
     type: String, 
     default: 'New Notification' 
    },
  message: {
     type: String, 
     required: true 
    },
  target: {
     type: String,
     enum: ['all', 'donor', 'hospital', 'bloodbank'],
     default: 'all'
    },
  status: {
     type: String, 
     enum: ['sent', 'pending', 'error'],
     default: 'sent' 
    },
  timestamp: {
     type: Date, 
     default: Date.now 
    }
}, { 
  timestamps: true
});

notificationSchema.index(
  { recipient: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      recipient: { $type: 'objectId' },
      type: 'welcome',
    },
  }
);

module.exports = mongoose.model('Notification', notificationSchema);

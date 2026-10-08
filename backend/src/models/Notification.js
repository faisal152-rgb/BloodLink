const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
     type: String, 
     default: 'New Notification' 
    },
  message: {
     type: String, 
     required: true 
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

module.exports = mongoose.model('Notification', notificationSchema);

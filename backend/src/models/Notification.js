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

module.exports = mongoose.model('Notification', notificationSchema);

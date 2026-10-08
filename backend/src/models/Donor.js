const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
     type: String, 
     required: true 
    },
  bloodGroup: {
     type: String, 
     required: true 
    },
  location: {
     type: String, 
     required: true 
    },
  contact: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['unpaid', 'paid'], 
    default: 'unpaid' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'blocked'], 
    default: 'pending' 
  },
  urgency: { 
    type: String, 
    enum: ['normal', 'urgent', 'emergency'], 
    default: 'normal' 
  },
  units: { 
    type: Number, 
    default: 1 
  },
  lastDonation: {
     type: Date, 
     default: Date.now 
    },
  availability: { type: String, default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);

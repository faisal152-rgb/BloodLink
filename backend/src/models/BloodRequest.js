const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patient:{
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  hospital: {
    type: String,
    required: true
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
  contact: {
     type: String, 
     required: true 
    },
  status: {
     type: String, 
     enum: ['pending', 'approved', 'completed', 'rejected'], 
     default: 'pending' 
  },
  location: {
     type: String 
  },
  notes: {
     type: String 
  },
  date: {
     type: Date, 
     default: Date.now 
  },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  totalDonors: {
    type: Number,
    default: 0
  },
  activeDonors: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);

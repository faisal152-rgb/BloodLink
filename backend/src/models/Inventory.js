const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  group: {
     type: String, 
     required: true, 
     unique: true 
    },
  units: {
     type: Number, 
     default: 0 
    },
  max: {
     type: Number, 
     default: 100 
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);

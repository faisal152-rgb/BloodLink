const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
     type: String, 
     required: true, 
     unique: true
     },
  password: {
     type: String, 
    },
  role: {
     type: String, 
     enum: ['admin', 'hospital', 'bloodbank', 'donor'],
     default: 'donor' 
    },
  avatar: {
     type: String 
    },
  hospitalName: {
     type: String 
    },
  phone: { type: String },
  Verified: { type: Boolean, default: false },

  // OAuth Provider IDs
  provider: {
    type: String, 
    enum: ['local', 'google', 'facebook', 'twitter'], 
    default: 'local' 
  },
  googleId: {
     type: String, 
     sparse: true 
    },
  facebookId: {
     type: String, 
     sparse: true 
    },
  twitterId: {
     type: String, 
     sparse: true 
    },
}, { 
  timestamps: true 
});

// Hash password before saving (only for local users)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

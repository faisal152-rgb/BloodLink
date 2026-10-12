const express = require('express');
const passport = require('../services/passport');
const { userAuth } = require('../middelware/auth');
const authrouter = express.Router();
const { 
  Login, 
  Register, 
  Profile, 
  updateProfile, 
  get, 
  refreshtoken, 
  verifyOtp,
  userLogout,
  sendTokenRedirect
} = require('../controller/auth');

const CLIENT_URL = process.env.CLIENT_URL;

// ─── Standard Auth Routes ─────────────────────────────────────────────────────
authrouter.post('/login', Login);
authrouter.post('/register', Register);
authrouter.post('/logout', userLogout);
authrouter.get('/profile', userAuth, Profile);
authrouter.post('/profile/update', userAuth, updateProfile);
authrouter.get('/profile/get', userAuth, get);
authrouter.get('/me', userAuth, get);
authrouter.post('/refreshtoken', refreshtoken);
authrouter.post('/verifyotp', verifyOtp);

// ─── Google OAuth Routes ──────────────────────────────────────────────────────
authrouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authrouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=google_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

// ─── Facebook OAuth Routes ────────────────────────────────────────────────────
authrouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
authrouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=facebook_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

// ─── Twitter / X OAuth Routes ─────────────────────────────────────────────────
authrouter.get('/twitter', passport.authenticate('twitter'));
authrouter.get(
  '/twitter/callback',
  passport.authenticate('twitter', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=twitter_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

module.exports = authrouter;

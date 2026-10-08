const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

// ─── Helper: Resolve role from .env email lists ───────────────────────────────
const resolveRoleFromEmail = (email) => {
  if (!email) return 'donor';
  const lower = email.toLowerCase();

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const hospitalEmails = (process.env.HOSPITAL_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const bloodbankEmails = (process.env.BLOODBANK_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

  if (adminEmails.includes(lower)) return 'admin';
  if (hospitalEmails.includes(lower)) return 'hospital';
  if (bloodbankEmails.includes(lower)) return 'bloodbank';
  return 'donor'; // default
};

// ─── Serialize / Deserialize ───────────────────────────────────────────────
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Google Strategy (only if credentials are set) ──────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const role = resolveRoleFromEmail(email);
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        if (user.role !== role) { user.role = role; await user.save(); }
        return done(null, user);
      }
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          user.role = role;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }
      }
      user = await User.create({
        name: profile.displayName || 'Google User',
        email: email || `google_${profile.id}@bloodlink.app`,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        provider: 'google',
        role,
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('⚠️  Google OAuth disabled — GOOGLE_CLIENT_ID not set in .env');
}

// ─── Facebook Strategy (only if credentials are set) ────────────────────────
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID !== 'YOUR_FACEBOOK_APP_ID') {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const role = resolveRoleFromEmail(email);
      let user = await User.findOne({ facebookId: profile.id });
      if (user) {
        if (user.role !== role) { user.role = role; await user.save(); }
        return done(null, user);
      }
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.facebookId = profile.id;
          user.role = role;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }
      }
      user = await User.create({
        name: profile.displayName || 'Facebook User',
        email: email || `facebook_${profile.id}@bloodlink.app`,
        facebookId: profile.id,
        avatar: profile.photos?.[0]?.value,
        provider: 'facebook',
        role,
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('⚠️  Facebook OAuth disabled — FACEBOOK_APP_ID not set in .env');
}

// ─── Twitter / X Strategy (only if credentials are set) ─────────────────────
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_KEY !== 'YOUR_TWITTER_CONSUMER_KEY') {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/callback',
    includeEmail: true,
  }, async (token, tokenSecret, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const role = resolveRoleFromEmail(email);
      let user = await User.findOne({ twitterId: profile.id });
      if (user) {
        if (user.role !== role) { user.role = role; await user.save(); }
        return done(null, user);
      }
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.twitterId = profile.id;
          user.role = role;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }
      }
      user = await User.create({
        name: profile.displayName || profile.username || 'X User',
        email: email || `twitter_${profile.id}@bloodlink.app`,
        twitterId: profile.id,
        avatar: profile.photos?.[0]?.value,
        provider: 'twitter',
        role,
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('⚠️  Twitter OAuth disabled — TWITTER_CONSUMER_KEY not set in .env');
}

module.exports = passport;

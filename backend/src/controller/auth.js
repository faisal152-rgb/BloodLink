const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const otpModel = require('../models/Otp');
const sessionModel = require('../models/session');
const { generateOtp, getOtpHtml } = require('../utils/generateOtp');
const redis = require('../config/redis');
const crypto = require('crypto');
const { Queue } = require('bullmq');
const emailQueue = new Queue('emailQueue', {
  connection: redis,
});


const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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
  return 'donor';
};

// ─── Helper: send token redirect to frontend ─────────────────────────────────
const sendTokenRedirect = (res, user) => {
  const accesstoken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const params = new URLSearchParams({
    accesstoken,
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    hospitalName: user.hospitalName || '',
    phone: user.phone || '',
    verified: user.Verified
  });
  res.redirect(`${CLIENT_URL}/auth/callback?${params.toString()}`);
};
// ─── Local Register ───────────────────────────────────────────────────────────
async function Register(req, res) {
  const { name, email, password, role: requestedRole } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      status: 400,
      message: "All fields are required",
    });
  }
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(200).json({
    message: "User already exists",
    status: "Fail",
  });
  try {
    const otp = generateOtp();
    await redis.del(`otp:${email}`);
    const html = getOtpHtml(otp);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.deleteOne({ email });
    const otpData = await otpModel.create({
      email: user.email,
      user: user._id,
      otpHash,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })
    await redis.set(`otp:${email}`, otp, 'EX', 5 * 60);
    console.log(otp)
    await emailQueue.add("sendEmail", {
      to: user.email,
      subject: `OTP Verification ${otp}`,
      text: `Your OTP is ${otp}`,
      html: html
    });
  }
  catch (err) {
    console.log(err);
    return res.status(403).json({
      Message: "OTP Not Sent",
      Status: "Fail",
    });
  }
  const role = requestedRole || resolveRoleFromEmail(email);
  const user = await User.create({ name, email, password, role, provider: 'local' });
  return res.status(201).json({
    Message: "Registration Successfull",
    Status: "Success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      hospitalName: user.hospitalName,
      phone: user.phone,
      verified: user.Verified
    }
  });
};

// ─── Local Login ─────────────────────────────────────────────────────────────
async function Login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        Status: "Fail",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        Status: "Fail",
      });
    }

    if (!user.password && user.provider !== 'local') {
      return res.status(400).json({
        message: `This email is linked to ${user.provider} login. Please log in with ${user.provider} or set a password first.`,
        Status: "Fail",
      });
    }

    const isValidPassword = await user.matchPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
        Status: "Fail",
      });
    }

    // Check if user email is verified
    if (!user.Verified) {
      try {
        const otp = generateOtp();
        await redis.del(`otp:${email}`);
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        await otpModel.deleteOne({ email });
        await otpModel.create({
          email: user.email,
          user: user._id,
          otpHash,
          expiresAt: Date.now() + 10 * 60 * 1000,
        });
        await redis.set(`otp:${email}`, otp, 'EX', 10 * 60);
        console.log("OTP for unverified user:", otp);
        await emailQueue.add("sendEmail", {
          to: user.email,
          subject: `OTP Verification ${otp}`,
          text: `Your OTP is ${otp}`,
          html: html
        });
      } catch (err) {
        console.log("OTP Send Error:", err);
      }

      return res.status(403).json({
        message: "Email not verified. OTP sent to your email.",
        requireOtp: true,
        email: user.email,
        Status: "Fail",
      });
    }

    // Verified User -> Generate Session & Tokens
    const refreshtoken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accesstoken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        hospitalName: user.hospitalName,
        phone: user.phone,
        verified: user.Verified
      },
      token: accesstoken,
      accesstoken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: error.message || "Internal server error", Status: "Fail" });
  }
};

//-------- Logout --------
async function userLogout(req, res) {
  const token = req.cookies.refreshtoken;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false
  });
  if (!session) {
    return res.status(401).json({
      message: "Unauthorized",
    })
  }
  session.revoked = true;
  await session.save();
  res.cookie("refreshtoken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 0,
  });
  return res.status(200).json({
    message: "Logout successfully",
    status: "Success"
  });
}
// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=google_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

// ─── Facebook OAuth ───────────────────────────────────────────────────────────
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=facebook_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

// ─── Twitter / X OAuth ────────────────────────────────────────────────────────
router.get('/twitter',
  passport.authenticate('twitter')
);
router.get('/twitter/callback',
  passport.authenticate('twitter', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=twitter_failed` }),
  (req, res) => sendTokenRedirect(res, req.user)
);

// ─── Profile ──────────────────────────────────────────────────────────────────
async function Profile(req, res) {
  const email = req.headers['user-email'];
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function updateProfile(req, res) {
  const { id, name, email, password, hospitalName, phone } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.hospitalName = hospitalName || user.hospitalName;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      hospitalName: updatedUser.hospitalName,
      phone: updatedUser.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get current user (using JWT token) ────────────────────────────────────────
async function get(req, res) {
  try {
    const token = req.cookies.refreshtoken;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "Failed"
      })
    }
    res.status(200).json({
      message: "User found successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        hospitalName: user.hospitalName
      },
      refreshtoken: token,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
async function refreshtoken(req, res) {
  const refreshToken = req.cookies.refreshtoken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized: No refresh token",
      status: "Failed"
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Refresh token invalid or expired",
      status: "Failed"
    });
  }

  try {
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false
    });
    if (!session) {
      return res.status(401).json({
        message: "Session not found or revoked",
        status: "Failed"
      });
    }

    // Rotate refresh token (revoke old, issue new)
    session.revoked = true;
    await session.save();

    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    session.refreshTokenHash = newRefreshTokenHash;
    session.revoked = false;
    await session.save();

    res.cookie("refreshtoken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      token: accessToken, // alias for frontend compatibility
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "Failed" });
  }
}
async function verifyOtp(req, res) {
  try {
    const { otp, Email } = req.body;
    if (!otp || !Email) {
      return res.status(400).json({ message: "OTP and Email required", status: "Failed" });
    }
    // ✅ Redis mein OTP exist kare toh verify karo, NOT reject
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpData = await otpModel.findOne({
      otpHash,
      expiresAt: { $gt: Date.now() }
    });
    if (!otpData) {
      return res.status(404).json({
        message: "OTP invalid or expired",
        status: "Failed"
      });
    }
    // ✅ userModel → User (already imported)
    const user = await User.findByIdAndUpdate(otpData.user,
      { Verified: true },
      { new: true }
    );
    await otpModel.deleteMany({ user: otpData.user });
    await redis.del(`otp:${Email}`);
    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        hospitalName: user.hospitalName,
        verified: user.Verified
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, status: "Failed" });
  }
}


module.exports = { Login, Register, Profile, updateProfile, get, refreshtoken, verifyOtp };
module.exports = { Login, Register, Profile, updateProfile, get, refreshtoken, verifyOtp };

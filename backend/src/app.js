const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./services/passport');
const connectDB = require('./config/db');
// Redis client auto-connects when required by route controllers
// Models
const User = require('./models/User');
const Donor = require('./models/Donor');
const BloodRequest = require('./models/BloodRequest');
// Routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const requestRoutes = require('./routes/request');
const dashboardRoutes = require('./routes/dashboard');
const locationRoutes = require('./routes/location');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://*.google.com', 'https://*.gstatic.com', 'https://*.facebook.com', 'https://*.twitter.com'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));

app.use(express.json());
app.use(cookieParser()); // ✅ req.cookies ke liye zaroori

// ─── Logger Middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ${res.statusCode} ${req.method} ${req.url}`);
  });
  next();
});

// ─── Session (required for OAuth redirect flow) ───────────────────────────────
app.use(session({
  secret: process.env.JWT_SECRET || 'bloodlink_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 1000 },
}));

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── Utility Routes ───────────────────────────────────────────────────────────
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.status(204).send());
app.get('/favicon.ico', (req, res) => res.status(204).send());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/donors', donorRoutes);
app.use('/donors', donorRoutes);

app.use('/api/requests', requestRoutes);
app.use('/requests', requestRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/locations', locationRoutes);
app.use('/locations', locationRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/admins', adminRoutes);
app.use('/admins', adminRoutes);

app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryRoutes);


// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.status(200).json({ message: 'Bloodlink API is running' }));

// ─── Start Database ─────────────────────────────────────────────────────────────
connectDB()



module.exports ={app};

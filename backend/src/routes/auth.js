const express = require('express');
const { userAuth } = require('../middelware/auth');
const authrouter = express.Router();
const { Login, Register, Profile, updateProfile, get, refreshtoken, verifyOtp } = require('../controller/auth');

//donor
authrouter.post('/login', Login);
authrouter.post('/register', Register);
authrouter.get('/profile', userAuth, Profile);
authrouter.post('/profile/update', userAuth, updateProfile);
authrouter.get('/profile/get', userAuth, get);
authrouter.get('/me', userAuth, get);
authrouter.post('/refreshtoken', refreshtoken);  // public — authenticates via httpOnly cookie
authrouter.post('/verifyotp', verifyOtp);

module.exports = authrouter;

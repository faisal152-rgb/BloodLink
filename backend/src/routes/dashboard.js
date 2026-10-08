const express = require('express');
const dashboardrouter = express.Router();
const { userAuth } = require('../middelware/auth');
const { getDashboardStats, getRecentDonations } = require('../controller/dashboard');

dashboardrouter.get('/stats', userAuth, getDashboardStats);
dashboardrouter.get('/recent-donations', userAuth, getRecentDonations);

module.exports = dashboardrouter;